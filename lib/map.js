///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
/////////      Declare Query Data        ///////////////////
//////////////////////////////////////////////////////////////////
var data_array =[], searchArea, TCresults, queryValue, queryLayer, queryName, locationQuery=[], queryType='location', animating = false, yearQuery = [],table;
var tableExists = false;    
         
//  ***************************************
// load and parse csv data using d3
d3.csv("data/dvrpc_geo_data.csv", function(d) {
  buildTable(d);
  console.log(d);
});

// **********************************
// Create the expanded row content
function format ( l ) {
    // `d` is the original data object for the row
    return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
        '<tr>'+
            '<td><b>Description:</b></br>'+l.desc+'</td>'+
        '</tr>'+
    '</table>';
}

// ***********************************
// Build the table based on csv data
function buildTable(data_elements){
    var Dtable=[];
    var getName = function(d){if(typeof d.NAME !== "undefined"){ return d.NAME.replace(d.OWNER.trim()+".", "").replace(/_/g, " ");}else{ return d.TABLE_NAME.replace(d.OWNER.trim()+".", "").replace(/_/g, " ");}},
        getType = function(d){if(typeof d.DATASET_TYPE !== "undefined"){ return d.DATASET_TYPE;}else{ return " ";}},
        getDataset = function(d){if(typeof d.FEATURE_DATATSET !== "undefined"){ return d.FEATURE_DATATSET.replace(/_/g, " ");}else{ return " ";}},
        getDesc = function(d){if(checkDesc(d) !== ""){return checkDesc(d);}else{return "No description provided.";}},
        checkDesc = function(d){if(typeof d.ABSTRACT !== "undefined"){ return d.ABSTRACT;}else if(typeof d.ABSTRACT !== "undefined"){ return d.PURPOSE;}else{return "No description provided.";}};

    $.each(data_elements, function(i, d){
        if(i>0){
            var rname = getName(d).trim(),
                rdata_type = getType(d).trim(),
                rdataset = getDataset(d).trim(),
                rtable = d.OWNER.trim(),
                rdesc = getDesc(d).trim();
            Dtable.push({"name":rname,"table":capitalize(rtable),"dataset":rdataset,"data_type":rdata_type,"desc":rdesc});
        }
    });
    table = $('#table').DataTable({
        data: Dtable,
        "columns": [
            {
                "className": 'details-control',
                "orderable": false,
                "data": null,
                "defaultContent": ''
            },
            { "data": "name", "title":"Name", "width":"65%"},
            { "data": "table", "title":"Database", "width":"10%" },
            { "data": "dataset", "title":"Feature Dataset", "width":"15%" },
            { "data": "data_type", "title":"Data Type", "width":"10%" }
        ],
        "order": [[ 2, "asc" ]],
        "pageLength": 15,
        "bLengthChange": false
        
    });  

    $(document.body).on('change','#dataset-select', function(){
            var val = $.fn.dataTable.util.escapeRegex(
                $(this).val()
            );
            table.columns(3)
                .search( val ? '^'+val+'$' : '', true, false )
                .draw();
    
    });  
    $(document.body).on('change','#database-select', function(){
            var val = $(this).val();
          
            table.columns(2)
                .search( val ? '^'+val+'$' : '', true, false )
                .draw();
    
    });  

    var dataset_items = table.columns(3).data().eq( 0 ).sort().unique(),
        database_items = table.columns(2).data().eq( 0 ).sort().unique();
    dataset_items.each(function (d) {$('#dataset-select').append('<option class="categoryFilter" value="'+d+'">'+d+'</option>');});
    database_items.each(function (d) {$('#database-select').append('<option class="categoryFilter" value="'+d+'">'+d+'</option>');});

}

$(document.body).on('click', '#table tbody td.details-control', function () {
    var tr = $(this).closest('tr');
    var row = table.row( tr );
    //close any open row
    
    if ( row.child.isShown() ) {
        // This row is already open - close it
        row.child.hide();
        tr.removeClass('shown');
    }
    else { 
        $('#table tr.shown').each(function(){
            var aRow = table.row($(this));
            aRow.child.hide();
            $(this).removeClass('shown');
        });
        // Open this row
        row.child( format(row.data()) ).show();
        tr.addClass('shown');
    }
});


    

function capitalize(s){
    return s.toLowerCase().replace( /\b./g, function(a){ return a.toUpperCase(); } );
}

