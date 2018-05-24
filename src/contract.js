'use strict';

var FileEntry = function (text) {
  if (text) {
    var o = JSON.parse(text);
    this.ipfsHash = o.ipfsHash;
    this.createdBy = o.createdBy;
    this.tags = (o.tags || '').split(',');
  } else {
    this.ipfsHash = '';
    this.createdBy = '';
    this.tags = '';
  }
};

FileEntry.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var FileUploaderContract = function () {
  LocalContractStorage.defineMapProperty(this, "arrayMap");

  LocalContractStorage.defineProperty(this, "size");

  LocalContractStorage.defineMapProperty(this, "dataMap", {
    parse: function (text) {
      return new FileEntry(text);
    },
    stringify: function (o) {
      return o.toString();
    }
  });
};

// save value to contract, only after height of block, users can takeout
FileUploaderContract.prototype = {
  init: function () {
    this.size = 0;
  },

  len:function(){
    return this.size;
  },

  save: function (ipfsHash = "", tags="") {
    var from = Blockchain.transaction.from;

    var fileEntry = this.dataMap.get(ipfsHash);

    if (fileEntry) {
      // throw new Error("The file has been saved");
      alert('文件已经上传过');
    } else {
      var fileEntry = new FileEntry();
      fileEntry.ipfsHash = ipfsHash;
      fileEntry.createdBy = from;
      fileEntry.tags = tags;
    }

    var index = this.size;
    this.arrayMap.set(index, ipfsHash);
    this.dataMap.set(ipfsHash, fileEntry);
    this.size +=1;
  },

  get: function (ipfsHash = '') {
    ipfsHash = ipfsHash.trim();
    if ( ipfsHash === "" ) {
      throw new Error("empty hash")
    }
    return this.dataMap.get(ipfsHash);
  },

  forEach: function(limit="10", offset="0"){
    limit = parseInt(limit);
    offset = parseInt(offset);
    if(offset>this.size){
       throw new Error("offset is not valid");
    }
    var number = offset+limit;
    if(number > this.size){
      number = this.size;
    }
    var result  = [];
    for(var i=offset;i<number;i++){
        var key = this.arrayMap.get(i);
        var object = this.dataMap.get(key);
        result.push(object);
    }
    return result;
  }
};

module.exports = FileUploaderContract;