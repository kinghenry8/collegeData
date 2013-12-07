exports.question6 = function(collegeDB) {
    var q6Results = {};
    function compare6(a,b) {
        if (q6Results[a]["revPerStudent"] > q6Results[b]["revPerStudent"])
            return -1;
        if (q6Results[a]["revPerStudent"] < q6Results[b]["revPerStudent"])
            return 1;
        return 0;
    }

    return function(req, res) {

        /*
         {
         UNITID : {
         revPerStudent:
         totRevenue:
         totStudents :
         instName:        // to add in processResults
         } ,
         UNITID : {
         revPerStudent:
         totRevenue:
         totStudents :
         instName:        // to add in processResults
         } ,

         }
         */
        function showFinalResults(sortedIds, req, res){
            var finalResult=[]
            for (i=0; i<20; i++ ) {
                var curUnitId=sortedIds[i]
                oneItem={
                    "unitId" : curUnitId,
                    "revPerStudent" : q6Results[curUnitId]["revPerStudent"],
                    "totStudents" : q6Results[curUnitId]["totStudents"],
                    "totRevenue" : q6Results[curUnitId]["totRevenue"],
                    "instName" : q6Results[curUnitId]["instName"]
                }
                finalResult.push(oneItem)
            }
            console.log(finalResult)
            res.render('question6',{"question6":finalResult});
        }

        function processResults(req,res){
            unitIds = Object.keys(q6Results);
            sortedUnitIds = unitIds.sort(compare6)
            retCnt=0
            genColl=collegeDB.collection("GEN")
            //console.log("SortedIds=" + sortedUnitIds)
            for(i=0;i<20;i++) {
                curUnitId=sortedUnitIds[i]
                console.log ( "Looking up [" + curUnitId + "]")
                genColl.find({UNITID:parseInt(curUnitId)},{UNITID:1,INSTNM:1}).toArray(
                    function (err, doc1) {
                        console.log(doc1)
                        if ( doc1.length ) {
                            runitId=doc1[0].UNITID
                            q6Results[runitId]["instName"] = doc1[0].INSTNM
                            retCnt++
                            if (retCnt == 20) {
                                showFinalResults(sortedUnitIds, req,res)
                            }
                        } else {
                            retCnt++
                            if (retCnt == 20) {
                                showFinalResults(sortedUnitIds,req,res)
                            }
                        }
                    }
                )
            }
        }

        coll = collegeDB.collection("ENR10")   // enrollments
        coll2= collegeDB.collection("FIN10")   // financials
        //console.log(coll);
        // first we check enrollment aggregates per each school (UNITID)
        console.log ("Fetching aggregate ENRollments ..")
        coll.aggregate({
                $group: { _id: "$UNITID",
                    totStuds: { $sum: "$EFYTOTLT"}  } }, function (err, docs) {
                console.log("Fetched " + docs.length + " records");
                var skipped=0;
                var rcnt=0 ;      // count of processed records
                docs.forEach(function(doc){
                    //console.log(doc._id);
                    // now we find the Revenue for the school (key=UNITID)
                    coll2.find({UNITID:doc._id},{UNITID:1, F1D01:1}).toArray(
                        function(err,docs2){
                            // console.log(docs2)
                            if (docs2.length) {
                                //console.log(docs2[0].F1A13);
                                var unitid = docs2[0].UNITID
                                var revs = docs2[0].F1D01;
                                var students = doc.totStuds;
                                q6Results[unitid]={};
                                var revPerStud = revs/students;
                                q6Results[unitid]["totStudents"]=students;
                                q6Results[unitid]["totRevenue"]=revs;
                                q6Results[unitid]["revPerStudent"]=revPerStud;
                                rcnt = _.size(q6Results) +skipped
                                if(rcnt==docs.length){
                                    processResults(req,res);
                                }
                            } else {
                                skipped++;
                                rcnt = _.size(q6Results) +skipped
                                if(rcnt==docs.length){
                                    processResults(req,res);
                                }
                            }
                            if ( docs.length - rcnt > 20 ) {
                                if ( (rcnt % 1000) == 0 ) {
                                    console.log ("processed " + rcnt)
                                }
                            } else {
                                console.log ("processed " + rcnt)
                            }
                        }
                    )
                })
            }
        );
    };
};

exports.question7 = function(collegeDB) {
    var q7Results = {};
    function compare7(a,b) {
        if (q7Results[a]["netAssPerStudent"] > q7Results[b]["netAssPerStudent"])
            return -1;
        if (q7Results[a]["netAssPerStudent"] < q7Results[b]["netAssPerStudent"])
            return 1;
        return 0;
    }

    return function(req, res) {

        /*
         {
         UNITID : {
         revPerStudent:
         totRevenue:
         totStudents :
         instName:        // to add in processResults
         } ,
         UNITID : {
         revPerStudent:
         totRevenue:
         totStudents :
         instName:        // to add in processResults
         } ,

         }
         */
        function showFinalResults(sortedIds, req, res){
            var finalResult=[]
            for (i=0; i<20; i++ ) {
                var curUnitId=sortedIds[i]
                console.log( curUnitId  +  " : " )
                oneItem={
                    "unitId" : curUnitId,
                    "netAssPerStudent" : q7Results[curUnitId]["netAssPerStudent"],
                    "totStudents" : q7Results[curUnitId]["totStudents"],
                    "totAss" : q7Results[curUnitId]["totAss"],
                    "instName" : q7Results[curUnitId]["instName"]
                }
                finalResult.push(oneItem)
            }
            console.log(finalResult)
            res.render('question7',{"question7":finalResult});
        }

        function processResults(req,res){
            unitIds = Object.keys(q7Results);
            sortedUnitIds = unitIds.sort(compare7)
            retCnt=0
            genColl=collegeDB.collection("GEN")
            //console.log("SortedIds=" + sortedUnitIds)
            for(i=0;i<20;i++) {
                curUnitId=sortedUnitIds[i]
                console.log ( "Looking up " + curUnitId )
                genColl.find({"UNITID" : parseInt(curUnitId)},{ "UNITID" :1, "INSTNM":1} ).toArray(
                    function (err, rdoc) {
                        console.log(rdoc)
                        if ( rdoc.length ) {
                            curUnitId=rdoc[0].UNITID
                            q7Results[curUnitId]["instName"] = rdoc[0].INSTNM
                            retCnt++
                            if (retCnt == 20) {
                                showFinalResults(sortedUnitIds, req,res)
                            }
                        } else {
                            retCnt++
                            if (retCnt == 20) {
                                showFinalResults(sortedUnitIds,req,res)
                            }
                        }
                    }
                )
            }
        }

        coll = collegeDB.collection("ENR10")   // enrollments
        coll2= collegeDB.collection("FIN10")   // financials
        //console.log(coll);
        // first we check enrollment aggregates per each school (UNITID)
        console.log ("Fetching aggregate ENRollments ..")
        coll.aggregate({
                $group: { _id: "$UNITID",
                    totStuds: { $sum: "$EFYTOTLT"}  } }, function (err, docs) {
                console.log("Fetched " + docs.length + " records");
                var skipped=0;
                var rcnt=0 ;      // count of processed records
                docs.forEach(function(doc){
                    //console.log(doc._id);
                    // now we find the Revenue for the school (key=UNITID)
                    coll2.find({UNITID:doc._id},{UNITID:1, F1A18:1}).toArray(
                        function(err,docs2){
                            // console.log(docs2)
                            if (docs2.length) {
                                //console.log(docs2[0].F1A13);
                                var unitid = docs2[0].UNITID
                                var netAss = docs2[0].F1A18;
                                var students = doc.totStuds;
                                q7Results[unitid]={};
                                var assPerStud = netAss/students;
                                q7Results[unitid]["totStudents"]=students;
                                q7Results[unitid]["totAss"]=netAss;
                                q7Results[unitid]["netAssPerStudent"]=assPerStud;
                                rcnt = _.size(q7Results) +skipped
                                if(rcnt==docs.length){
                                    processResults(req,res);
                                }
                            } else {
                                skipped++;
                                rcnt = _.size(q7Results) +skipped
                                if(rcnt==docs.length){
                                    processResults(req,res);
                                }
                            }
                            if ( docs.length - rcnt > 20 ) {
                                if ( (rcnt % 1000) == 0 ) {
                                    console.log ("processed " + rcnt)
                                }
                            } else {
                                console.log ("processed " + rcnt)
                            }
                        }
                    )
                })
            }
        );
    };
};

exports.question8 = function(collegeDB) {
    var q8Results = {};
    function compare8(a,b) {
        if (q8Results[a]["liabilitiesPerStudent"] > q8Results[b]["liabilitiesPerStudent"])
            return -1;
        if (q8Results[a]["liabilitiesPerStudent"] < q8Results[b]["liabilitiesPerStudent"])
            return 1;
        return 0;
    }

    return function(req, res) {

        /*
         {
         UNITID : {
         revPerStudent:
         totRevenue:
         totStudents :
         instName:        // to add in processResults
         } ,
         UNITID : {
         revPerStudent:
         totRevenue:
         totStudents :
         instName:        // to add in processResults
         } ,

         }
         */
        function showFinalResults(sortedIds, req, res){
            var finalResult=[]
            for (i=0; i<20; i++ ) {
                var curUnitId=sortedIds[i]
                console.log( curUnitId  +  " : " )
                oneItem={
                    "unitId" : curUnitId,
                    "liabilitiesPerStudent" : q8Results[curUnitId]["liabilitiesPerStudent"],
                    "totStudents" : q8Results[curUnitId]["totStudents"],
                    "totLiabilities" : q8Results[curUnitId]["totLiabilities"],
                    "instName" : q8Results[curUnitId]["instName"]
                }
                finalResult.push(oneItem)
            }
            console.log(finalResult)
            res.render('question8',{"question8":finalResult});
        }

        function processResults(req,res){
            unitIds = Object.keys(q8Results);
            sortedUnitIds = unitIds.sort(compare8)
            retCnt=0
            genColl=collegeDB.collection("GEN")
            //console.log("SortedIds=" + sortedUnitIds)
            for(i=0;i<20;i++) {
                curUnitId=sortedUnitIds[i]
                console.log ( "Looking up " + curUnitId )
                genColl.find({"UNITID" : parseInt(curUnitId)},{ "UNITID" :1, "INSTNM":1} ).toArray(
                    function (err, rdoc) {
                        console.log(rdoc)
                        if ( rdoc.length ) {
                            curUnitId=rdoc[0].UNITID
                            q8Results[curUnitId]["instName"] = rdoc[0].INSTNM
                            retCnt++
                            if (retCnt == 20) {
                                showFinalResults(sortedUnitIds, req,res)
                            }
                        } else {
                            retCnt++
                            if (retCnt == 20) {
                                showFinalResults(sortedUnitIds,req,res)
                            }
                        }
                    }
                )
            }
        }

        coll = collegeDB.collection("ENR10")   // enrollments
        coll2= collegeDB.collection("FIN10")   // financials
        //console.log(coll);
        // first we check enrollment aggregates per each school (UNITID)
        console.log ("Fetching aggregate ENRollments ..")
        coll.aggregate({
                $group: { _id: "$UNITID",
                    totStuds: { $sum: "$EFYTOTLT"}  } }, function (err, docs) {
                console.log("Fetched " + docs.length + " records");
                var skipped=0;
                var rcnt=0 ;      // count of processed records
                docs.forEach(function(doc){
                    //console.log(doc._id);
                    // now we find the Revenue for the school (key=UNITID)
                    coll2.find({UNITID:doc._id},{UNITID:1, F1A13:1}).toArray(
                        function(err,docs2){
                            // console.log(docs2)
                            if (docs2.length) {
                                //console.log(docs2[0].F1A13);
                                var unitid = docs2[0].UNITID
                                var totalLiabilities = docs2[0].F1A13;
                                var students = doc.totStuds;
                                q8Results[unitid]={};
                                var liabilitiesPerStudent = totalLiabilities/students;
                                q8Results[unitid]["totStudents"]=students;
                                q8Results[unitid]["totLiabilities"]=totalLiabilities;
                                q8Results[unitid]["liabilitiesPerStudent"]=liabilitiesPerStudent;
                                rcnt = _.size(q8Results) +skipped
                                if(rcnt==docs.length){
                                    processResults(req,res);
                                }
                            } else {
                                skipped++;
                                rcnt = _.size(q8Results) +skipped
                                if(rcnt==docs.length){
                                    processResults(req,res);
                                }
                            }
                            if ( docs.length - rcnt > 20 ) {
                                if ( (rcnt % 1000) == 0 ) {
                                    console.log ("processed " + rcnt)
                                }
                            } else {
                                console.log ("processed " + rcnt)
                            }
                        }
                    )
                })
            }
        );
    };
};