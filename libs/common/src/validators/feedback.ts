import { ObjectId } from "mongodb";
import * as _ from 'lodash';

export function validateCreateOffline(req: any, body: any) {
    let errors = [];

    if (!body.rating) {
        errors.push({ params: 'rating', message: 'Rating is required.' });
    }
    if (!body.practiceSetId) {
        errors.push({ params: 'practiceSetId', message: 'Practice test id is required.' });
    }
    if (!body.comment) {
        errors.push({ params: 'comment', message: 'Comment is required.' });
    }
    if (body.comment && body.comment.length > 4000) {
        errors.push({ params: 'comment', message: 'Comment must be smaller than 4000 characters.' });
    }
    if (!body.idOffline) {
        errors.push({ params: 'idOffline', message: 'Only accept your feedback when you do a test.' });
    }

    const result = {
        user: new ObjectId(req.user._id as string),
        rating: body.rating,
        comment: body.comment,
        attemptId: body.attemptId,
        practiceSetId: body.practiceSetId,
        owner: body.owner,
        idOffline: body.idOffline,
        errors: errors.length > 0 ? errors : null
    };

    return { errors: errors.length > 0 ? errors : null, result };
}

export function validateSharingLink(req: any, reqBody: any) {
    var error = [];
    var errors = null;
    if (!reqBody.emails && !reqBody.phones || (reqBody.emails && reqBody.emails.length === 0) || (reqBody.phones && reqBody.phones.length === 0)) {
        error.push({ params: 'emails', message: 'At least one email or phone number is required.' })
    }
    if (error.length > 0) {
        errors = error;
    }
    const data = _.assign({}, reqBody, { user: req.user });

    return {
        errors: errors.length > 0 ? errors : null,
        data
    };
}
