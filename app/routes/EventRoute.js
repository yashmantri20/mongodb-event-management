const express = require('express');
const { validateToken } = require('../../auth');
const { validEventCreated, validInviteInput } = require('../../EventValidation');
const { paginatedResult } = require('../../utils/pagination');

const Event = require('../models/Event');
const User = require('../models/User');

var events = express.Router();

events
    .route('/createEvent')
    .post(validateToken, async (req, res) => {
        const { eventName, description, date } = req.body;
        const err = validEventCreated(eventName, description, date);

        if (err) return res.json({
            message: err
        })

        try {
            const userId = req.decoded;
            const findUser = await User.findById(userId.id);
            const event = await Event.create({ eventName, description, date, createdBy: findUser.username });
            findUser.eventsCreated.push(event);
            await findUser.save();
            res.json({
                message: "Event Created"
            })

        } catch (error) {
            res.json({
                message: "Please Try Again"
            })
        }
    })

events
    .route('/createdEvents')
    .get(validateToken, paginatedResult(Event), async (req, res) => {
        try {
            const user = req.decoded;
            const findUser = await User.findById(user.id).populate('eventsCreated');

            return res.json({
                message: "All Events",
                events: findUser.eventsCreated
            })
        } catch (error) {
            res.json({
                message: "Please Try Again"
            })
        }
    })

events
    .route('/:eventId/invite')
    .put(validateToken, async (req, res) => {
        const { email } = req.body;
        const err = validInviteInput(email);
        if (err) return res.json({
            message: err
        })

        try {
            const event = await Event.findById(req.params.eventId);
            const user = await User.findOne({ email });

            if (!event) return res.json({
                message: "Please Enter Valid Event Id"
            })

            if (!user) return res.json({
                message: "Please Enter Email who is on Event Management"
            })

            const userAlreadyInvited = event.invitedUsers.includes(email);
            if (userAlreadyInvited) return res.json({
                message: "User Already Invited"
            })
            user.eventsInvited.push({
                createdBy: event.createdBy,
                eventName: event.eventName,
                CreatedAt: event.createdAt,
            });
            event.invitedUsers.push({ name: user.username, email });

            await user.save();
            await event.save();
            return res.json({
                message: "Invited Successfully",
                data: event.invitedUsers
            })
        } catch (error) {
            res.json({
                message: "Please Try Again"
            })
        }
    })

events
    .route('/invitedEvents')
    .get(validateToken, async (req, res) => {
        try {
            const user = req.decoded;
            const findUser = await User.findById(user.id);
            return res.json({
                message: "All Events",
                events: findUser.eventsInvited
            })
        } catch (error) {
            res.json({
                message: "Please Try Again"
            })
        }
    })

events
    .route('/:eventId')
    .get(async (req, res) => {
        const event = await Event.findById(req.params.eventId);
        if (!event) return res.json({
            message: "Event Does not exist"
        })
        return res.json({
            message: "Event Details",
            event: event
        })
    })

events
    .route('/:eventId/updateEvent')
    .put(validateToken, async (req, res) => {
        const { eventName, description, date } = req.body;
        const err = validEventCreated(eventName, description, date);

        if (err) return res.json({
            message: err
        })

        try {
            const userId = req.decoded;
            const event = await Event.findById(req.params.eventId);

            await event.updateOne({ eventName, description, date });
            res.json({
                message: "Event Updated",
                data: event
            })

        } catch (error) {
            res.json({
                message: "Please Try Again"
            })
        }
    })

module.exports = events;