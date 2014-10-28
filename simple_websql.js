var db = (function(){
	var _this = window;

	return {
		DB: null,
		/**
	     * 连接表
	     * @param {String} dbName
	     * @param {String} version
	     * @param {String} describe
	     * @param {Number} size
	     */
		dbConnect : function(dbName,dbVersion,dbDesc,dbSize){
          	
	        try {
	            if (!window.openDatabase) {
	                console.log('Databases are not supported in this browser.');
	                return false;
	            } else {
	                dbName      = dbName ? dbName : 'SHICAI_APP';
	                dbVersion   = dbVersion ? dbVersion : '1.0';
	                dbDesc      = dbDesc ? dbDesc : 'SHICAI_DB for User Mobile';
	                dbSize      = dbSize ? dbSize : (2 * 1024 * 1024);
	                  
	                _this.DB = openDatabase(dbName, dbVersion, dbDesc, dbSize);
	                  
	                return true;
	            }
	        } catch(e) {
	            if (e == 2) {
	                console.log("Invalid database version.");
	            } else {
	                console.log("Unknown error "+e+".");
	            }
	            return false;
	        }
	          
	    },
	    /**
	     * 创建表
	     * @param {String} tableName
	     * @param {Object} tableField
	     */
	    dbDefineTable : function(tableName,tableField){
	        if(!tableName || !tableField){
	            console.log('ERROR: Function "dbCreateTable" tableName or tableField is NULL.');
	        }
	        var fieldArr = [];
	        var fieldItem;
	        var i = 0;
	          
	        for (var field in tableField){
	            field.toString();
	            tableField[field].toString();
	            //fieldArr[i] = field+' '+tableField[field];
	            fieldArr[i] = field;
	            i++;
	        }
	        fieldItem = fieldArr.join(",").toString();
	          
	        var SQL = 'CREATE TABLE IF NOT EXISTS '+tableName+' (';
	        SQL += fieldItem;
	        SQL +=')';
	        console.log(SQL);
	          
	        _this.DB.transaction(function(tx){
	            tx.executeSql(SQL,[],function(tx,result){
	                return true;
	            },function(tx,error){
	                console.log(error);
	                return false;
	            });
	        });
	    },
	      
	    /**
	     * 插入数据
	     * @param {String} tableName
	     * @param {Object} tableField
	     * @param {Function} funName
	     */
	    dbInsert : function(tableName,tableField,funName){
	      
	        if(!tableField){
	            console.log('ERROR: FUNCTION dbInsert tableField is NULL');
	            return false;
	        }
	          
	        var fieldKeyArr = [];
	        var fieldValueArr = [];
	        var fieldKey;
	        var fieldValue;
	        var i = 0;
	          
	        for (var field in tableField){
	          
	            field.toString();
	            tableField[field].toString();
	            fieldKeyArr[i] = field;
	            fieldValueArr[i] = tableField[field];
	            if(typeof(fieldValueArr[i]) !== 'number'){
	                fieldValueArr[i] = '"'+fieldValueArr[i]+'"';
	            }
	            i++;
	        }
	        fieldKey = fieldKeyArr.join(",");
	        fieldValue = fieldValueArr.join(",");
	  
	        var SQL = 'INSERT INTO '+tableName+' (';
	        SQL += fieldKey;
	        SQL += ') ';
	        SQL += 'VALUES (';
	        SQL += fieldValue;
	        SQL += ')';
	        console.log(SQL);
	          
	        _this.DB.transaction(function(tx){
	            tx.executeSql(SQL,[],function(tx,result){
	                return true;
	            },function(tx,error){
	                console.log(error);
	                return false;
	            });
	        });
	    },
	      
	    /**
	     * 查询所有结果
	     * @param {String}  tableName
	     * @param {Function} funName
	     * @param {Object}  tableField
	     * @param {Object}  dbParams
	     */
	    dbFindAll : function(tableName,funName,funErr,tableField,dbParams){
	  
	        tableField = tableField ? tableField : '*';
	        if(!tableName || !funName){
	            console.log('ERROR: Function "dbFindAll" tableName or funName is NULL.');
	        }
	          
	        var SQL = '';
	        SQL +='SELECT '+tableField+' FROM '+tableName;
	        
	        console.log(SQL);

	        _this.DB.transaction(function(tx){
	            tx.executeSql(SQL,[],_findSuccess,function(tx,error){
	                funErr && funErr(error);
	                return false;
	            });
	        });
	        
	        function _findSuccess(tx,result){
	            funName(result);
	        }
	  
	    },
	      
	    /**
	     * 删除数据
	     * @param {String}  tableName
	     * @param {Object}  dbParams
	     * @param {Function} funName
	     */
	    dbDelete : function(tableName,dbParams,funName){
	      
	        if(!tableName || !dbParams){
	            console.log('ERROR: FUNCTION "dbDelete" tableName or dbParams is NULL');
	            return false;
	        }
	        var SQL = '';
	        SQL +='DELETE FROM '+tableName+' WHERE ';
	          
	        var paramArr = new Array();
	        var paramStr = '';
	        var i=0;
	        for(var k in dbParams){
	            if(typeof(dbParams[k]) !== 'number'){
	                dbParams[k] = '"'+dbParams[k]+'"';
	            }
	            paramArr[i] = k.toString()+'='+dbParams[k];
	            i++;
	        }
	        paramStr = paramArr.join(" AND ");
	        SQL += paramStr;
	          
	        _this.DB.transaction(function(tx){
	                tx.executeSql(SQL);
	            },[],function(tx,result){
	                funName(result);
	            },function(tx,error){
	                console.log(error);
	                return false;
	            });
	        console.log(SQL);
	    },
	      
	    /**
	     * 更新数据表
	     * @param {String}  *tableName
	     * @param {Object}  *dbParams
	     * @param {Object}  *dbWhere
	     * @param {Function} funName
	     */
	    dbUpdate : function(tableName,dbParams,dbWhere,funName){
	  
	        var SQL = 'UPDATE '+tableName+' SET ';
	        var paramArr = new Array();
	        var paramStr = '';
	        var i=0;
	        for(var k in dbParams){
	            if(typeof(dbParams[k]) !== 'number'){
	                dbParams[k] = '"'+dbParams[k]+'"';
	            }
	            paramArr[i] = k.toString()+'='+dbParams[k];
	            i++;
	        }
	        paramStr = paramArr.join(" , ");
	          
	        SQL += paramStr;

	        if(dbWhere){
	        	SQL += ' WHERE ';
	          
		        var whereArr = new Array();
		        var whereStr = '';
		        var n=0;
		        for(var w in dbWhere){
		              
		            if(typeof(dbWhere[w]) !=='number'){
		                dbWhere[n] = '"'+dbWhere[w]+'"';
		            }
		            whereArr[n] = w.toString()+'='+dbWhere[w];
		            n++;
		        }
		          
		        whereStr = whereArr.join(" AND ");
		          
		        SQL += whereStr;
	        }
	        
	          
	        console.log(SQL);
	        _this.DB.transaction(function(tx){
	            tx.executeSql(SQL,[],function(tx,result){
	                return true;
	            },function(tx,error){
	                console.log(error);
	                return false;
	            });
	        });
	        console.log(SQL);
	          
	    },
	      
	    /**
	     * 清空数据表
	     * @param {String} tableName
	     * @return {Boolean}
	     */
	    dbTruncate : function(tableName){
	      
	        if(!tableName){
	            console.log('ERROR:Table Name is NULL');
	            return false;
	        }
	          
	        function _TRUNCATE(tableName){
	            _this.DB.transaction(function(tx){
	                tx.executeSql('DELETE TABLE '+tableName);
	            },[],function(tx,result){
	                console.log('DELETE TABLE '+tableName);
	                return true;
	            },function(tx,error){
	                console.log(error);
	                return false;
	            })
	        }
	          
	        _TRUNCATE(tableName);
	    },
	      
	    /**
	     * @desc 删除数据表
	     * @param {String} tableName
	     * @return {Boolean}
	     */
	    dbDrop : function(tableName){
	          
	        if(!tableName){
	            console.log('ERROR:Table Name is NULL');
	            return false;
	        }
	          
	        function _DROP(tableName){
	            _this.DB.transaction(function(tx){
	                tx.executeSql('DROP TABLE '+tableName);
	            },[],function(tx,result){
	                console.log('DROP TABLE '+tableName);
	                return true;
	            },function(tx,error){
	                console.log(error);
	                return false;
	            })
	        }
	          
	        _DROP(tableName);
	    }
	}
})();