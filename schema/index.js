const Joi = require('joi')
    .extend(require('@joi/date'));

/**Articles Schema */
const schema = Joi.object().keys({
    id: Joi.number().required(),
    title: Joi.string().required(),
    date: Joi.date().format('YYYY-MM-DD').required(),
    body: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).required()
})


/**Validate given data against joi schema */
module.exports = validate = async (data) => {
    return await schema.validate(data, {abortEarly: false})
}