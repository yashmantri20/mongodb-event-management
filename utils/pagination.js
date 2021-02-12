module.exports.paginatedResult = (
    model,
    sortFlag = true,
) => {
    return async (req, res, next) => {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        let sort = {}
        const searchFilter = {}
        const dateFilter = {}

        if (req.query.searchfilter) {
            const searchfilter = req.query.searchfilter.split(':')
            searchFilter[searchfilter[0]] = {
                $regex: searchfilter[1],
                $options: "$i",
            }
        }

        if (req.query.dateFilter) {
            const strfilter = req.query.dateFilter.split(':')
            dateFilter[strfilter[0]] = {
                $eq: strfilter[1],
                $exists: true,
            }
        }

        if (req.query.sort) {
            const str = req.query.sort.split(':')
            sort[str[0]] = str[1] === 'desc' ? -1 : 1
        }
        else {
            sort = { createdAt: 1 }
        }
        const startIndex = (page - 1) * limit;
        try {
            let results;
            if (sortFlag) {
                results = await model
                    .find(dateFilter)
                    .limit(limit)
                    .skip(startIndex)
                    .sort(sort)
                    .exec();
            } else {
                results = await model.find().limit(limit).skip(startIndex).exec();
                console.log(results)
            }
            const count = await model.countDocuments();
            res.json({
                results,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
            });
        } catch (err) {
            res.json({ message: err.message });
        }
    };
};