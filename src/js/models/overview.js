var OverViewModule = function () {


    return {

        getOverView: (mm, yyyy, callback) => {
            knex.select().from('overview').where("mm", mm).andWhere('yyyy', yyyy)
                .then((result) => {
                    callback(result);
                })
        },

        getAllOverView: (yyyy, callback) => {
            knex.select().from('overview').where('yyyy', yyyy).orderBy('mm', 'asc')
                .then((result) => {
                    callback(result);
                })
        }
        ,
        updateOverView: (sign, overview, callback) => {

            // rowname = overview.name

            if (overview.name == "income") {
                knex('overview')
                    .update({
                        income: knex.raw('income ' + sign + " " + overview.data)
                    }).where("mm", overview.mm).andWhere('yyyy', overview.yyyy).then((result) => {

                        if (result == 0) {
                            knex('overview').insert({ income: overview.data,expance:0, mm: overview.mm, yyyy: overview.yyyy })
                                .then((result) =>
                                    callback(result)
                                )

                        } else {

                            callback(result)

                        }

                    })

            } else {

                knex('overview')
                .update({
                    expance: knex.raw('expance ' + sign + " " + overview.data)
                }).where("mm", overview.mm).andWhere('yyyy', overview.yyyy).then((result) => {

                    if (result == 0) {
                        knex('overview').insert({ expance: overview.data, income:0, mm: overview.mm, yyyy: overview.yyyy })
                            .then((result) =>
                                callback(result)
                            )
                    } else {
                        callback(result)
                    }

                })
            }

        }

    }

}();

module.exports = OverViewModule;
