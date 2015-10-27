///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
/////////      Declare Query Data        ///////////////////
//////////////////////////////////////////////////////////////////
var data_array =[], searchArea, TCresults, queryValue, queryLayer, queryName, locationQuery=[], queryType='location', animating = false, yearQuery = [],table;
var tableExists = false;    
         
//  ***************************************
// load and parse csv data using d3
d3.csv("data/dvrpc_geo_inventory.csv", function(dataList) {
    d3.csv("data/dvrpc_field_inventory.csv", function(f){
        buildTable(dataList);
   


// **********************************
// Create the expanded row content
function format ( l ) {
    // `d` is the original data object for the row
    return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
        '<tr>'+
            '<td><b>Description:</b><div class="well well-sm scroll-vert">'+l.desc+'</div></td>'+
        '</tr>'+
    '</table>';
}
function getName(d){if(typeof d.NAME !== "undefined"){ return d.NAME.replace(d.OWNER.trim()+".", "").replace(/_/g, " ");}else{ return d.TABLE_NAME.replace(d.OWNER.trim()+".", "").replace(/_/g, " ");}}
function getType(d){if(typeof d.DATASET_TYPE !== "undefined"){ return d.DATASET_TYPE;}else{ return " ";}}
function getDataset(d){if(typeof d.FEATURE_DATATSET !== "undefined"){ return d.FEATURE_DATATSET.replace(/_/g, " ");}else{ return " ";}}
function getDesc(d){if(checkDesc(d) !== ""){return checkDesc(d);}else{return "No description provided.";}}
function checkDesc(d){if(typeof d.ABSTRACT !== "undefined"){ return d.ABSTRACT;}else if(typeof d.ABSTRACT !== "undefined"){ return d.PURPOSE;}else{return "No description provided.";}}
function getKeys(d){if(typeof d.SEARCH_KEYS !== "undefined"){return d.SEARCH_KEYS;}else{return "";}}
// ***********************************
// Build the table based on csv data
function buildTable(data_elements){
    var Dtable=[];
    

    $.each(data_elements, function(i, d){
        if(i>0){
            var rname = getName(d).trim(),
                rdata_type = getType(d).trim(),
                rdataset = getDataset(d).trim(),
                rtable = d.OWNER.trim(),
                rdesc = getDesc(d).trim(),
                rsearch = getKeys(d),
                rlink = d.OWNER+"."+d.TABLE_NAME;
            Dtable.push({"name":rname,"table":capitalize(rtable),"dataset":rdataset,"data_type":rdata_type,"desc":rdesc,"tags":rsearch, "links":rlink});
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
            { "data": "name", "title":"Name", "width":"65%", "className": "data-link"},
            { "data": "table", "title":"Database", "width":"10%" },
            { "data": "dataset", "title":"Feature Dataset", "width":"15%" },
            { "data": "data_type", "title":"Data Type", "width":"10%" },
            { "data": "tags", "title": "Tags", "visible": false},
            { "data": "links", "visible": false}
        ],
        "order": [[ 2, "asc" ]],
        "pageLength": 15,
        "bLengthChange": false,
        "dom": '<"toolbar">frtip'
        
    });  
    $('#table thead th').removeClass('data-link');
    $('#table tbody').on( 'click', 'td', function () {
        if(table.cell(this).index().column === 1){
            var trow = table
                            .cell(this)
                            .index().row;
            var datarow = table.row(trow)
                                .data();
            feature_details(datarow.links);
        }
    });


    // ****************************
    // selection filters

    $(document.body).on('change','#dataset-select', function(){
            var val = $(this).val();
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
    removeA(dataset_items, '');
    $("div.toolbar").html('<b>Filter by:</b> Database: <select id="database-select"><option class="categoryFilter" value="">Show All</option></select>&nbsp;&nbsp;&nbsp;Dataset: <select id="dataset-select"><option class="categoryFilter" value="">Show All</option></select>');
    dataset_items.each(function (d) {$('#dataset-select').append('<option class="categoryFilter" value="'+d+'">'+d+'</option>');});
    database_items.each(function (d) {$('#database-select').append('<option class="categoryFilter" value="'+d+'">'+d+'</option>');});

    // *********************************
}


// ****************************************
// expand row to show description

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

// *********************************************

function feature_details(data_item){
    show_features();
    window.location.hash = data_item;
    for(var i = 0; i < dataList.length; i++){
        if(dataList[i].OWNER+"."+dataList[i].TABLE_NAME != data_item){    
            var di = dataList[i];
            $('#d-name').html(getName(di));
            $('#d-location').html(data_item);
            $('#d-contact').html('No contact provided')
            $('#d-dataset').html(getDataset(di));
        }
    }
}

function show_features(){
    if($('#feature').hasClass('hidden')){
        $('#feature').toggleClass('hidden');
        $('#core-page').toggleClass('hidden');

    }
}
function show_table(){
    if($('#core-page').hasClass('hidden')){
        $('#feature').toggleClass('hidden');
        $('#core-page').toggleClass('hidden');
    }

}
// ******************************************
// helper functions

function removeA(arr) {
    var what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax= arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
}
    

function capitalize(s){
    return s.toLowerCase().replace( /\b./g, function(a){ return a.toUpperCase(); } );
}
 
function getLocationHash () {
  return window.location.hash.substring(1);
}
//create navigation of content based on hash changes for self contained app
$(window).bind('hashchange', function() {
    var tab_id = getLocationHash();
    if(tab_id != ""){
        feature_details(tab_id);
    }else{
        show_table();
    }
    
});


//close the d3 csv's
 });
});