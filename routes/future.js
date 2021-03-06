exports.question3 = function() {
    function compare(a,b) {
        if (a.F1A18 > b.F1A18)
            return -1;
        if (a.F1A18 < b.F1A18)
            return 1;
        return 0;
    }
    return function(req, res) {
        var opts1 = {sort:{F1A18:-1}};
        var flds1 = {UNITID:1,F1A18:1};
        var flds2 = {INSTNM:1};
        var results = [];
        coll = collegeDB.collection("univs")
        coll.find( {rowType:"FIN"}, flds1, opts1).toArray(
            function (err, docs) {
                docs.forEach(function(oneDoc){
                    console.log(oneDoc._id,oneDoc.F1A18);
                    if(oneDoc.F1A18!=""){
                        coll.find({rowType:"GEN",UNITID:oneDoc.UNITID},flds2).toArray(
                            function(err,doc){
                                if (err) console.log(err);
                                var univName = doc[0].INSTNM;
                                var oneResult = {UNITID:oneDoc.UNITID, F1A18:oneDoc.F1A18, INSTNM:univName};
                                //console.log(results);
                                results.push(oneResult);
                                if(results.length==20){
                                    results.sort(compare);
                                    //console.log(results);
                                    res.render('question3',{"question3":results});
                                }
                            }
                        )
                    }

                })
            }
        );


    };
};

exports.question4 = function() {
    function compare(a,b) {
        if (a.F1D01 > b.F1D01)
            return -1;
        if (a.F1D01 < b.F1D01)
            return 1;
        return 0;
    }
    return function(req, res) {
        var opts1 = {sort:{F1D01:-1}};
        var flds1 = {UNITID:1,F1D01:1};
        var flds2 = {INSTNM:1};
        var results = [];
        coll = collegeDB.collection("univs")
        coll.find( {rowType:"FIN"}, flds1, opts1).toArray(
            function (err, docs) {
                docs.forEach(function(oneDoc){
                    console.log(oneDoc._id,oneDoc.F1D01);
                    if(oneDoc.F1D01!=""){
                        coll.find({rowType:"GEN",UNITID:oneDoc.UNITID},flds2).toArray(
                            function(err,doc){
                                if (err) console.log(err);
                                var univName = doc[0].INSTNM;
                                var oneResult = {UNITID:oneDoc.UNITID, F1D01:oneDoc.F1D01, INSTNM:univName};
                                //console.log(results);
                                results.push(oneResult);
                                if(results.length==20){
                                    results.sort(compare);
                                    //console.log(results);
                                    res.render('question4',{"question4":results});
                                }
                            }
                        )
                    }

                })
            }
        );


    };
};

exports.question6 = function() {
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

exports.question7 = function() {
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

exports.question8 = function() {
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

//----------------------------------------------------------
exports.question9 = function(){
    /*
    var sampleResults = [
        {
        unitId: 1,
        univName:"NJIT",
        totStudents:12,
        totLiabilities:53245,
        totAss:12,
        revPerStudent:52,
        netAssPerStudent:5523,
        liabilitiesPerStudent:55},
        ]
    */

    var q9Results = {};

    //----------------------------------------
    return function(req, res) {

        function showFinalResults(allUnitIds, req, res){
            var finalResults=[]
            for (i=0; i<allUnitIds.length; i++ ) {
                var curUnitId=allUnitIds[i]
                oneItem={ 
                     "unitId" : curUnitId, 
                     "univName" : q9Results[curUnitId]["instName"],
                     "totStudents" : q9Results[curUnitId]["totStudents"],
                     "totLiabilities" : q9Results[curUnitId]["totLiabs"],
                     "totAss" : q9Results[curUnitId]["totAssets"],
                     "revPerStudent" : q9Results[curUnitId]["revPerStudent"],
                     "netAssPerStudent" : q9Results[curUnitId]["assetsPerStudent"],
                     "liabilitiesPerStudent" : q9Results[curUnitId]["liabPerStudent"],
                     }
                finalResults.push(oneItem)
            }
            // console.log(finalResult)
            res.render('question9',{"question9": finalResults});
        }

        function processResults(req,res){
            unitIds = Object.keys(q9Results);
            retCnt=0
            genColl=collegeDB.collection("GEN")
            for(i=0;i<unitIds.length; i++) {
                curUnitId=unitIds[i]
                console.log ( "Looking up [" + curUnitId + "]")
                genColl.find({UNITID:parseInt(curUnitId)},{UNITID:1,INSTNM:1}).toArray(
                    function (err, doc1) {
                         console.log(doc1)
                         if ( doc1.length ) {
                             runitId=doc1[0].UNITID
                             q9Results[runitId]["instName"] = doc1[0].INSTNM
                             retCnt++
                             if (retCnt == unitIds.length) {
                                showFinalResults(unitIds, req,res) 
                             }
                        } else {
                             retCnt++
                             if (retCnt == unitIds.length) {
                                showFinalResults(unitIds,req,res)
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
                  coll2.find({UNITID:doc._id},{UNITID:1, F1A13:1, F1A18:1, F1D01:1 }).toArray(
                      function(err,docs2){
                          // console.log(docs2)
                          if (docs2.length) {
                              //console.log(docs2[0].F1A13);
                              var unitid = docs2[0].UNITID
                              var liabs = docs2[0].F1A13;  // liabilities
                              var assets = docs2[0].F1A18; // assets
                              var revs = docs2[0].F1D01;   // revenue
                              var students = doc.totStuds;

                              q9Results[unitid]={};
                              var revPerStud = Math.round(revs/students*100)/100;
                              var liabPerStud = Math.round(liabs/students*100)/100;
                              var assetsPerStud = Math.round(assets/students*100)/100;

                              q9Results[unitid]["totLiabs"]=liabs;
                              q9Results[unitid]["totAssets"]=assets;
                              q9Results[unitid]["totStudents"]=students;
                              q9Results[unitid]["totRevenue"]=revs;
                              q9Results[unitid]["revPerStudent"]=revPerStud;
                              q9Results[unitid]["liabPerStudent"]=liabPerStud;
                              q9Results[unitid]["assetsPerStudent"]=assetsPerStud;

                              rcnt = _.size(q9Results) +skipped
                              if(rcnt==docs.length){
                                 processResults(req,res);
                              } 
                          } else {
                              skipped++;
                              rcnt = _.size(q9Results) +skipped
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
}

//--------------------------------------------------
exports.question10 = function() {

    return function(req, res) {
        var opts1 = {limit:1000,sort:{INSTNM:-1}};
        var flds1 = {UNITID:1,STABBR:1,INSTNM:1};
        var lookup = req.param('stateAbbr') || "MO";
        coll = collegeDB.collection("univs")
        coll.find({rowType:"GEN",STABBR:lookup},flds1,opts1).toArray(
            function(err,doc){
                if (err) console.log(err);
                res.render('question10',{"question10":doc})

            });
        };
};

//---------------------------------------------------


// Max to Min Change in liabilities

exports.question11 = function() {
    var q11FinalResult=[]
    var q11DeltasBySchool={}

    function compare11(a,b) {
        var aLiabs = parseFloat(q11DeltasBySchool[a]["deltaLiabs"])
        var bLiabs = parseFloat(q11DeltasBySchool[b]["deltaLiabs"])

        if (aLiabs > bLiabs )  {
            //console.log ( "a > b" , aLiabs, bLiabs)
            return -1;
        }
        if (aLiabs < bLiabs) {
            //console.log ( "a < b" , aLiabs, bLiabs)
            return 1 ;
        }
        return 0;
    }

    function showFinalResults(sortedIds, req, res){
        q11FinalResult=[]
        for (i=0; i<20; i++ ) {
            var curUnitId=sortedIds[i]
            oneItem={
                "unitId" : curUnitId,
                "deltaLiabs" : q11DeltasBySchool[curUnitId]["deltaLiabs"],
                "totLiabs10" : q11DeltasBySchool[curUnitId]["totLiabs10"],
                "totLiabs11" : q11DeltasBySchool[curUnitId]["totLiabs11"],
                "instName" : q11DeltasBySchool[curUnitId]["instName"]
            }
            q11FinalResult.push(oneItem)
        }
        console.log(q11FinalResult)
        res.render('question11',{"question11":q11FinalResult});
    }

    function processFinalResults(req,res){
        unitIds = Object.keys(q11DeltasBySchool);
        sortedUnitIds = unitIds.sort(compare11)
        retCnt=0
        genColl=collegeDB.collection("GEN")
        //console.log("SortedIds=" + sortedUnitIds)
        for(i=0;i<20;i++) {
            curUnitId=sortedUnitIds[i]
            console.log ( "q11_Looking up [" + curUnitId + "]")
            genColl.find({UNITID:parseInt(curUnitId)},{UNITID:1,INSTNM:1}).toArray(
                function (err, doc1) {
                    console.log(doc1)
                    if ( doc1.length ) {
                        runitId=doc1[0].UNITID
                        q11DeltasBySchool[runitId]["instName"] = doc1[0].INSTNM
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
    //----------------------------------------

    return function(req, res) {
        collFin10 = collegeDB.collection("FIN10")   // financials-2010
        collFin11 = collegeDB.collection("FIN11")   // financials-2011
        //------------ Lvl1 Fetch -------
        console.log ("Q11: Fetching aggregate 2010 Liabilities..")
        collFin10.aggregate(
            {
                $group: { _id: "$UNITID",
                    totLiabs: { $sum: "$F1A13"}  }
            }, function (err, docs1) {
                console.log("Q11: Fetched " + docs1.length + " records");
                var skipped=0;
                var rcnt=0 ;      // count of processed records
                var pcnt=0 ;   // rcnt + skipped
                var liabs2010={}

                function skipIt() {
                    skipped++
                    pcnt=rcnt+skipped
                    if ( pcnt == docs1.length) {
                        console.log( "Done")
                        processFinalResults(req,res)
                    }
                }

                function takeIt() {
                    rcnt++
                    pcnt=rcnt+skipped
                    if ( pcnt == docs1.length) {
                        console.log( "Done")
                        processFinalResults(req,res)
                    }
                }

                console.log("Q11: Now Fetch matching corresponding 2011 liabilities");
                docs1.forEach( function(doc1){
                        liabs2010[doc1._id]=doc1.totLiabs
                        // db.ENR11.aggregate( [ { $match : { UNITID: 196307} }, { $group : {_id: "$UNITID", "totStuds": { $sum: "$EFYTOTLT"} } } ] )
                        collFin11.aggregate(
                            [
                                {
                                    $match : {
                                        UNITID : parseInt(doc1._id)
                                    }
                                },
                                {
                                    $group: {
                                        _id: "$UNITID",
                                        totLiabs: { $sum: "$F1A13"}
                                    }
                                }
                            ] , function (err, docs2) {
                                if  (docs2.length ) {
                                    var unitId=docs2[0]._id
                                    var totLiabs11=(docs2[0].totLiabs)
                                    var totLiabs10=liabs2010[unitId]
                                    // console.log (totLiabs10, " -->  " ,  totLiabs11)
                                    if ( isNaN(totLiabs11) || isNaN(totLiabs10) ) {
                                        skipIt()
                                    } else if ( totLiabs10 == 0 ) {
                                        skipIt()
                                    } else {
                                        //console.log( "UNITID: " +  unitId )
                                        //console.log( "2011: " +  totLiabs11 )
                                        //console.log( "2010: " +  totLiabs10 )
                                        var deltaPercent= ((totLiabs11 - totLiabs10 )/totLiabs10)*100
                                        q11DeltasBySchool[unitId]={
                                            "totLiabs11" : totLiabs11,
                                            "totLiabs10" : totLiabs10,
                                            "deltaLiabs" : Math.round( deltaPercent *100) / 100
                                        }
                                        takeIt()
                                    }
                                } else {
                                    skipIt()
                                }

                                if ( (docs1.length - pcnt) < 20 )  {
                                    console.log ("Q11: " + pcnt )
                                }  else {
                                    if  ( (pcnt % 1000 ) == 0 ) {
                                        console.log ("q11: " + pcnt )
                                    }
                                }
                            }
                        )
                    }  // docs.forEach
                )
            }  // agg Lvl1 CB func
        )  // agg Lvl 1
    }  // outer func (req,res)
} // exported func


//---------------------------------------------------------
exports.question12 = function() {
    var q12FinalResult=[]
    var q12DeltasBySchool={}

    function compare12(a,b) {
        if (q12DeltasBySchool[a]["deltaPercent"] > q12DeltasBySchool[b]["deltaPercent"])
            return -1;
        if (q12DeltasBySchool[a]["deltaPercent"] < q12DeltasBySchool[b]["deltaPercent"])
            return 1;
        return 0;
    }

    function showFinalResults(sortedIds, req, res){
        var finalResult=[]
        for (i=0; i<20; i++ ) {
            var curUnitId=sortedIds[i]
            oneItem={
                "unitId" : curUnitId,
                "deltaPercent" : q12DeltasBySchool[curUnitId]["deltaPercent"],
                "totStuds2010" : q12DeltasBySchool[curUnitId]["totStuds2010"],
                "totStuds2011" : q12DeltasBySchool[curUnitId]["totStuds2011"],
                "instName" : q12DeltasBySchool[curUnitId]["instName"]
            }
            q12FinalResult.push(oneItem)
        }
        console.log(q12FinalResult)
        res.render('question12',{"question12":q12FinalResult});
    }

    function processFinalResults(req,res){
        unitIds = Object.keys(q12DeltasBySchool);
        sortedUnitIds = unitIds.sort(compare12)
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
                        q12DeltasBySchool[runitId]["instName"] = doc1[0].INSTNM
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
    //----------------------------------------
    return function(req, res) {
        collEnr10 = collegeDB.collection("ENR10")   // enrollments-2010
        collEnr11 = collegeDB.collection("ENR11")   // enrollments-2011
        var  totStudents2010={}
        //------------ Lvl1 Fetch -------
        console.log ("Q12: Fetching aggregate 2010 enrollments ..")
        collEnr10.aggregate(
            {
                $group: { _id: "$UNITID",
                    totStuds: { $sum: "$EFYTOTLT"}  }
            }, function (err, docs1) {
                console.log("Q12: Fetched " + docs1.length + " records");
                var skipped=0;
                var rcnt=0 ;      // count of processed records
                var pcnt=0 ;   // rcnt + skipped
                console.log("Q12: Now Fetch matching 2011 enrollments");
                docs1.forEach( function(doc1){
                        // db.ENR11.aggregate( [ { $match : { UNITID: 196307} }, { $group : {_id: "$UNITID", "totStuds": { $sum: "$EFYTOTLT"} } } ] )
                        totStudents2010[doc1._id] = doc1.totStuds
                        collEnr11.aggregate(
                            [
                                {
                                    $match : {
                                        UNITID : parseInt(doc1._id)
                                    }
                                },
                                {
                                    $group: {
                                        _id: "$UNITID",
                                        totStuds: { $sum: "$EFYTOTLT"}
                                    }
                                }
                            ] , function (err, docs2) {
                                // console.log (docs2)
                                if  (docs2.length ) {
                                    rcnt++
                                    var unitId=docs2[0]._id
                                    var totStuds11=docs2[0].totStuds
                                    var totStuds10=totStudents2010[unitId]
                                    //console.log( "UNITID: " +  unitId )
                                    //console.log( "2011: " +  totStuds11 )
                                    //console.log( "2010: " +  totStuds10 )
                                    //var deltaPercent=( (totStuds11 - totStuds10) / totStuds10 )*100
                                    var deltaPercent=(totStuds11 - totStuds10) / totStuds10 * 100
                                    q12DeltasBySchool[unitId]={
                                        "totStuds2011" : totStuds11,
                                        "totStuds2010" : totStuds10,
                                        //"deltaPercent" : Math.round(deltaPercent*100)/100
                                        "deltaPercent" : Math.round(deltaPercent*100)/100
                                    }
                                    pcnt=rcnt+skipped
                                    if ( pcnt == docs1.length) {
                                        console.log( "Done")
                                        processFinalResults(req,res)
                                    }
                                } else  {
                                    skipped++
                                    pcnt=rcnt+skipped
                                    if ( pcnt == docs1.length) {
                                        console.log( "Done")
                                        processFinalResults(req,res)
                                    }
                                }

                                if ( (docs1.length - pcnt) < 20 )  {
                                    console.log ("q12: " + pcnt )
                                }  else {
                                    if  ( (pcnt % 1000 ) == 0 ) {
                                        console.log ("q12: " + pcnt )
                                    }
                                }
                            }
                        )
                    }  // docs.forEach
                )
            }  // agg Lvl1 CB func
        )  // agg Lvl 1
    }  // outer func (req,res)
} // exported func
    exports.univTest = function() {
    return function(req, res) {
       coll = collegeDB.collection("univs")
       /*coll.find( {rowType: "ENR"}, {UNITID: 1, EFYTOTL:1}, function (err, results) {
           console.log (results)
       })*/
        var univTest =[
            {UNITID: 1,INSTNM:"NJIT",EFYTOTLT:12},
            {UNITID: 1,INSTNM:"NJIT",EFYTOTLT:12},
            {UNITID: 1,INSTNM:"NJIT",EFYTOTLT:12}
        ]
        res.render('univs',{"univs":univTest});
    };
};

