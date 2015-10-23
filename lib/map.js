///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
/////////      Declare Query Data        ///////////////////
//////////////////////////////////////////////////////////////////
var data_array =[], searchArea, TCresults, queryValue, queryLayer, queryName, locationQuery=[], queryType='location', animating = false, yearQuery = [],table;
var tableExists = false;    
         
//  ***************************************
d3.csv("data/dvrpc_geo_data.csv", function(d) {
  buildTable(d);
});






function buildTable(data_elements){
    var TCtable=[];
    //console.log(data_elements);

    $.each(data_elements, function(i, d){
      if(i>0){
        var name = function(){if(typeof d.NAME !== "undefined"){ return d.NAME}else{ return d.TABLE_NAME}} ,
            data_type = function(){if(typeof d.DATASET_TYPE !== "undefined"){ return d.DATASET_TYPE}else{ return " "}},
            dataset = function(){if(typeof d.FEATURE_DATASET !== "undefined"){ return d.FEATURE_DATASET}else{ return " "}},
            table = d.OWNER; 
        TCtable.push([name,capitalize(table),dataset,data_type]);
    }
    });
    table = $('#table').DataTable({
        "aaData": TCtable,
        aoColumns: [ { sWidth: "35%" , sTitle:"Name" }, { sWidth: "15%", sTitle:"Database" }, { sWidth: "25%", sTitle:"Feature Dataset"}, { sWidth: "25%", sTitle:"Data Type"  }],
        "order": [[ 0, "desc" ]],
        initComplete: function () {

            this.api().columns().every( function () {
                var column = this;
                console.log(column);
                var select = $('<select><option value=""></option></select>')
                    .appendTo( $(column.footer()).empty() )
                    .on( 'change', function () {
                        var val = $.fn.dataTable.util.escapeRegex(
                            $(this).val()
                        );
 
                        column
                            .search( val ? '^'+val+'$' : '', true, false )
                            .draw();
                    } );
 
                column.data().unique().sort().each( function ( d, j ) {
                    select.append( '<option value="'+d+'">'+d+'</option>' )
                } );
            } );
        },
        "pageLength": 15,
        "bLengthChange": false
        
    });
}


function capitalize(s){
    return s.toLowerCase().replace( /\b./g, function(a){ return a.toUpperCase(); } );
};

