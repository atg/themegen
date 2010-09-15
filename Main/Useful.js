function getElementsByClass(classname, node)  {
    if(!node) node = document.getElementsByTagName("body")[0];
    var a = [];
    var re = new RegExp('\\b' + classname + '\\b');
    var els = node.getElementsByTagName("*");
    for(var i=0,j=els.length; i<j; i++)
        if(re.test(els[i].className))a.push(els[i]);
    return a;
}

function makeZones(zoneNames) {
    var newZones = [];
    for (var i = 0; i < zoneNames.length; i++)
    {
        newZones.push({
            'name':zoneNames[i],
            'importance': i / (zoneNames.length - 1),
            'likeness': 0.5
        });
    }
    return newZones;
}