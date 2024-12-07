const { default: mongoose } = require('mongoose')
const productModel = require('../models/product.model')
const userModel = require('../models/user.model')
const transactionModel = require('../models/transaction.model')
const BaseError = require('../errors/base.error')
const { TransactionState } = require('../enum/transaction.enum')

class UzumService {
	async check(data) {
		const { serviceId, params } = data
		const { productId, userId } = params

		if (!this.checkServiceId(serviceId)) {
			throw new BaseError.BadRequest(this.createErrorResponse(serviceId, 'ErrorCheckingPaymentData'))
		}

		if (!this.checkObjectId(productId)) {
			throw new BaseError.BadRequest(this.createErrorResponse(serviceId, 'ErrorCheckingPaymentData'))
		}
		const product = await productModel.findById(productId)
		if (!product) {
			throw new BaseError.BadRequest(this.createErrorResponse(serviceId, 'ErrorCheckingPaymentData'))
		}

		if (!this.checkObjectId(userId)) {
			throw new BaseError.BadRequest(this.createErrorResponse(serviceId, 'ErrorCheckingPaymentData'))
		}
		const user = await userModel.findById(userId)
		if (!user) {
			throw new BaseError.BadRequest(this.createErrorResponse(serviceId, 'ErrorCheckingPaymentData'))
		}

		return { serviceId, timestamp: Date.now(), status: 'OK', data: { params } }
	}
	async create(data) {
		const { serviceId, params, transId, amount } = data
		const { userId, productId } = params

		if (!this.checkServiceId(serviceId)) {
			throw new BaseError.BadRequest(this.createErrorResponse(serviceId, 'ErrorCheckingPaymentData'))
		}

		const existingTransaction = await transactionModel.findOne({
			id: transId,
			product: productId,
			user: userId,
			provider: 'uzum',
		})

		if (existingTransaction) {
			throw new BaseError.BadRequest(this.createErrorResponse(serviceId, 'TransactionAlreadyExists'))
		}

		const product = await productModel.findById(productId)
		if (!product) {
			throw new BaseError.BadRequest(this.createErrorResponse(serviceId, 'ProductNotFound'))
		}

		if (product.price !== amount / 100) {
			throw new BaseError.BadRequest(this.createErrorResponse(serviceId, 'InvalidAmount'))
		}

		const user = await userModel.findById(userId)
		if (!user) {
			throw new BaseError.BadRequest(this.createErrorResponse(serviceId, 'UserNotFound'))
		}

		await transactionModel.create({
			id: transId,
			amount,
			user: user._id,
			state: TransactionState.Pending,
			provider: 'uzum',
			product: product._id,
		})

		return { serviceId, timestamp: Date.now(), status: 'CREATED', transTime: Date.now(), transId, amount }
	}
	async confirm(data) {
		const { serviceId, transId } = data

		if (!this.checkServiceId(serviceId)) {
			throw new BaseError.BadRequest(this.createErrorResponse(serviceId, 'ErrorCheckingPaymentData'))
		}

		const transaction = await transactionModel.findOne({ id: transId })
		if (!transaction) {
			throw new BaseError.BadRequest(this.createErrorResponse(serviceId, 'TransactionNotFound'))
		}

		if (transaction.state !== TransactionState.Pending) {
			throw new BaseError.BadRequest(this.createErrorResponse(serviceId, 'TransactionAlreadyConfirmed'))
		}

		if (transaction.provider !== 'uzum') {
			throw new BaseError.BadRequest(this.createErrorResponse(serviceId, 'InvalidProvider'))
		}

		transaction.state = TransactionState.Paid
		transaction.perform_time = new Date()
		await transaction.save()

		return { serviceId, transId, status: 'CONFIRMED', confirmTime: Date.now() }
	}
	async reverse(data) {
		const { serviceId, transId } = data
		if (!this.checkServiceId(serviceId)) {
			throw new BaseError.BadRequest(this.createErrorResponse(serviceId, 'ErrorCheckingPaymentData'))
		}

		const transaction = await transactionModel.findOne({ id: transId })
		if (!transaction) {
			throw new BaseError.BadRequest(this.createErrorResponse(serviceId, 'TransactionNotFound'))
		}

		transaction.state = TransactionState.PaidCanceled
		transaction.cancel_time = new Date()
		await transaction.save()

		return { serviceId, transId, status: 'REVERSED', reverseTime: Date.now(), amount: transaction.amount }
	}
	async status(data) {
		const { serviceId, transId } = data
		if (!this.checkServiceId(serviceId)) {
			throw new BaseError.BadRequest(this.createErrorResponse(serviceId, 'ErrorCheckingPaymentData'))
		}

		const transaction = await transactionModel.findOne({ id: transId })
		if (!transaction) {
			throw new BaseError.BadRequest(this.createErrorResponse(serviceId, 'TransactionNotFound'))
		}

		return { serviceId, transId, status: 'CONFIRMED' }
	}

	checkServiceId(serviceId) {
		return +serviceId === +process.env.UZUM_SERVICE_ID
	}

	checkObjectId(id) {
		return mongoose.Types.ObjectId.isValid(id)
	}

	createError(serviceId, errorCode) {
		return { serviceId, timestamp: Date.now(), status: 'FAILED', errorCode }
	}

	createErrorResponse(serviceId, errorCode) {
		return this.createError(serviceId, errorCode)
	}
}

module.exports = new UzumService()
