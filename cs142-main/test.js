async.each(ListA, function (itemA, callback) { //loop through array
    //process itemA
    async.each(itemA.Children, function (itemAChild, callback1) { //loop through array
        //process itemAChild
        callback1();
    }, function (err) {
        console.log("InnerLoopFinished");
        callback();
    });
}, function (err) {
    console.log("OuterLoopFinished");
    console.log('Process Finished');
});


async.each(test, function (member, done) {
    async.each(member.comments, function (comment, done1) {
        User.findById(comment.user_id, function (err, info) {
            if (err) {
                console.err("error: " + err);
                done1(err);
                return;
            }

            info = JSON.parse(JSON.stringify(info));
            delete info.__v;
            delete info.location;
            delete info.description;
            delete info.occupation;
            comment.user = info;
            done1(err);
        });
    }, function (err) {
        done(err);
    },
        function (err) {
            if (err) {
                response.status(500).send(err);
            }
            response.status(200).send(test);
        });

});