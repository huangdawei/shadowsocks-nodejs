// Generated by CoffeeScript 1.3.3
(function() {
  var Encryptor, cachedTables, crypto, encrypt, getTable, int32Max, merge_sort;

  crypto = require("crypto");

  merge_sort = require("./merge_sort").merge_sort;

  int32Max = Math.pow(2, 32);

  cachedTables = {};

  getTable = function(key) {
    var ah, al, decrypt_table, hash, i, md5sum, result, table;
    if (cachedTables[key]) {
      return cachedTables[key];
    }
    table = new Array(256);
    decrypt_table = new Array(256);
    md5sum = crypto.createHash("md5");
    md5sum.update(key);
    hash = new Buffer(md5sum.digest(), "binary");
    al = hash.readUInt32LE(0);
    ah = hash.readUInt32LE(4);
    i = 0;
    while (i < 256) {
      table[i] = i;
      i++;
    }
    i = 1;
    while (i < 1024) {
      table = merge_sort(table, function(x, y) {
        return ((ah % (x + i)) * int32Max + al) % (x + i) - ((ah % (y + i)) * int32Max + al) % (y + i);
      });
      i++;
    }
    i = 0;
    while (i < 256) {
      decrypt_table[table[i]] = i;
      ++i;
    }
    result = [table, decrypt_table];
    cachedTables[key] = result;
    return result;
  };

  encrypt = function(table, buf) {
    var i;
    i = 0;
    while (i < buf.length) {
      buf[i] = table[buf[i]];
      i++;
    }
    return buf;
  };

  Encryptor = (function() {

    function Encryptor(key, method) {
      var _ref;
      this.method = method;
      if (this.method === null) {
        _ref = getTable(key), this.encryptTable = _ref[0], this.decryptTable = _ref[1];
      } else {
        this.cipher = crypto.createCipher(this.method, key);
        this.decipher = crypto.createDecipher(this.method, key);
      }
    }

    Encryptor.prototype.encrypt = function(buf) {
      var result;
      if (this.method === null) {
        return encrypt(this.encryptTable, buf);
      } else {
        console.log(buf);
        result = new Buffer(this.cipher.update(buf.toString('binary')));
        console.log(result);
        return result;
      }
    };

    Encryptor.prototype.decrypt = function(buf) {
      var result;
      if (this.method === null) {
        return encrypt(this.decryptTable, buf);
      } else {
        console.log(buf);
        result = new Buffer(this.decipher.update(buf.toString('binary')));
        console.log(result);
        return result;
      }
    };

    return Encryptor;

  })();

  exports.Encryptor = Encryptor;

}).call(this);
