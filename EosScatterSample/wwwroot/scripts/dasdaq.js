function clone(x) {
    var json = JSON.stringify(x);
    return JSON.parse(json);
}