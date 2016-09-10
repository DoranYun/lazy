(function (win) {

    function Sequence(source) {
        this._source = source;
    }

    function Iterator(source) {
        this._source = source;
        this._index = 0;
    }

    Iterator.prototype._next = function () {
        var res;
        if (this._source instanceof Iterator) {
            res = this._source.next();
        }
        else {
            if (this._index < this._source.length) {
                res = this._source[this._index++];
            }
            else {
                res = undefined;
            }
        }

        return res;
    };

    function FilterIterator(source, callback) {
        Iterator.call(this, source);
        this._callback = callback;
    }
    FilterIterator.prototype = new Iterator();
    FilterIterator.prototype.next = function () {
        var res,item;

        do {
            item = this._next();
            if (item === undefined) {
                break;
            }
            res = this._callback(item);
            if (res === true) {
                break;
            }
        } while (item !== undefined);

        return item;
    };

    function MapIterator(source, callback) {
        this._callback = callback;
        Iterator.call(this, source);
    }
    MapIterator.prototype = new Iterator();
    MapIterator.prototype.next = function () {
        var item = this._next();
        return item === undefined ? undefined : this._callback(item);
    };

    function TakeIterator(source, num) {
        Iterator.call(this, source);
        this._num = num;
        this._count = 0;
    }
    TakeIterator.prototype = new Iterator();
    TakeIterator.prototype.next = function () {
        if (this._count < this._num) {
            this._count++;
            return this._next();
        }

        return undefined;
    };

    function MapIteratorWrapper (source, callback) {
        return new Sequence(new MapIterator(source, callback))
    }

    function FilterIteratorWrapper (source, callback) {
        return new Sequence(new FilterIterator(source, callback))
    }

    function TakeIteratorWrapper (source, num) {
        return new Sequence(new TakeIterator(source, num))
    }

    Sequence.prototype = {
        constructor: Sequence,
        filter: function (callback) {
            return new FilterIteratorWrapper(this._source, callback);
        },
        map: function (callback) {
            return new MapIteratorWrapper(this._source, callback);
        },
        take: function (num) {
            return new TakeIteratorWrapper(this._source, num);
        },
        each: function () {
            var arr = [], res;

            do {
                res = this._source.next();

                if (res !== undefined) {
                    arr.push(res);
                }
            } while (res !== undefined);

            return new Sequence(arr);
        },
        value: function () {
           return this.each()._source.slice(0);
        }
    };

    win.Lazy = function (arr) {
        return new Sequence(arr);
    };

} (window));
