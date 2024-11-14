export const globals = {
    lookup: {
        $lookup: {
            from: 'attemptdetails',
            localField: '_id',
            foreignField: 'attempt',
            as: 'someField',
        },
    },
    unw: {
        $unwind: '$someField',
    },
    add: {
        $addFields: {
            QA: '$someField.QA',
        },
    },
    pro: {
        $project: {
            someField: 0,
        },
    },
};