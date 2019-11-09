var openalpr = require ("node-openalpr");
openalpr.Start ();
openalpr.GetVersion ();
function openal(){
    function identify (id, path) {
        console.log (openalpr.IdentifyLicense (path, function (error, output) {
            var results = output.results;
            console.log ("OPEN"+id +" "+ output.processing_time_ms +" "+ ((results.length > 0) ? results[0].plate : "No results"));

            if (id == 349) {
                console.log (openalpr.Stop ());
            }
        }));
    }
    return {
        identify
    };
}


module.exports = openal;