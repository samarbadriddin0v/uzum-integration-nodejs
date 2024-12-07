const uzumService = require('../services/uzum.service')

class UzumController {
	async check(req, res, next) {
		try {
			const data = await uzumService.check(req.body)
			res.json(data)
		} catch (error) {
			next(error)
		}
	}
	async create(req, res, next) {
		try {
			const data = await uzumService.create(req.body)
			res.json(data)
		} catch (error) {
			next(error)
		}
	}
	async confirm(req, res, next) {
		try {
			const data = await uzumService.confirm(req.body)
			res.json(data)
		} catch (error) {
			next(error)
		}
	}
	async reverse(req, res, next) {
		try {
			const data = await uzumService.reverse(req.body)
			res.json(data)
		} catch (error) {
			next(error)
		}
	}
	async status(req, res, next) {
		try {
			const data = await uzumService.status(req.body)
			res.json(data)
		} catch (error) {
			next(error)
		}
	}
}

module.exports = new UzumController()
