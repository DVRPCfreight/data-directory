///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
/////////      Declare Query Data        /////////////////// 
//////////////////////////////////////////////////////////////////
var data_array =[], searchArea, TCresults, queryValue, queryLayer, queryName, locationQuery=[], queryType='location', animating = false, yearQuery = [],table;
var tableExists = false;    
var bad_features = ["BOUNDARIES_UrbanAreas_PA_Modified","BOUNDARIES_MunicipalBoundaries_Line","BOUNDARIES_MunicipalBoundaries","BOUNDARIES_DVRPC_MCD_PhiCPA","BOUNDARIES_CountyBoundaries_Line","BOUNDARIES_StateBoundaries_Line","ENVIRONMENT_PA_IntList_NonAttaining_2012","ENVIRONMENT_PA_IntList_Attaining_2012","LOCATION_Phila_Neigh_Inq_Large","LOCATION_Phila_Neigh_Inq_LessKnown","LOCATION_Phila_Neigh_Inq_Small","PARCELS_Montgomery_Parcels","PLANNING_DVRPC_LandUse_2010","PLANNING_DVRPC_LandUse_2005","PLANNING_DVRPC_LandUse_2000","PLANNING_NJ_PinelandsBoundary","STRUCTURES_NJ_FireSta","STRUCTURES_NJ_LawEnf","TRANSPORTATION_PassengerRail","TRANSPORTATION_Shuttles_PA","TRANSPORTATION_PassengerRailStations"];       

// partial page height handling
var height = $(window).height();    
var width = $(window).width();  
var th = Math.floor((height - 255)/35);

//  ***************************************
// load and parse csv data using d3
d3.csv("data/dvrpc_geo_inventory.csv", function(dataList) {
    d3.csv("data/dvrpc_field_inventory.csv", function(fields){
        buildTable(dataList);
   


// **********************************
// Create the expanded row content
function format ( l ) {
    // `l' is the original data object for the row
    return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
        '<tr>'+
            '<td><b>Description:</b><div class="well well-sm scroll-vert">'+l.desc+'</div></td>'+
        '</tr>'+
    '</table>';
}
function getName(d){if(typeof d.NAME !== "undefined"){ return d.NAME.replace(d.OWNER.trim()+".", "").replace(/_/g, " ");}else{ return d.TABLE_NAME.replace(d.OWNER.trim()+".", "").replace(/_/g, " ");}}
function getType(d){if(typeof d.DATASET_TYPE !== "undefined"){ return d.DATASET_TYPE;}else{ return " ";}}
function getDataset(d){if(typeof d.FEATURE_DATATSET !== "undefined"){ return d.FEATURE_DATATSET.replace(/_/g, " ");}else{ return " ";}}
function getDatasetVal(d){if(d.FEATURE_DATATSET !== ""){ return d.FEATURE_DATATSET.replace(/_/g, " ");}else{ return "none provided";}}
function getDesc(d){if(checkDesc(d) !== ""){return checkDesc(d);}else{return "No description provided.";}}
function checkDesc(d){if(typeof d.ABSTRACT !== "undefined"){ return d.ABSTRACT;}else if(typeof d.ABSTRACT !== "undefined"){ return d.PURPOSE;}else{return "No description provided.";}}
function getKeys(d){if(typeof d.SEARCH_KEYS !== "undefined"){return d.SEARCH_KEYS;}else{return "";}}
function formatDate(d){if(typeof d.MOD_DATE !== "undefined"){}}


// ***********************************
// Build the table based on csv data
function buildTable(data_elements){
    var Dtable=[];
    var table_list = [];

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
            { "data": "dataset", "title":"Feature Dataset", "width":"20%" },
            { "data": "data_type", "title":"Data Type", "width":"10%" },
            { "data": "tags", "title": "Tags", "visible": false},
            { "data": "links", "visible": false}
        ],
        "order": [[ 2, "asc" ]],
        "pageLength": th,
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
    $(document.body).on('click','#filter-reset', function(){
        // $('#table_filter input[type=search]').val('');
        table.columns(2).search('')
                .draw();
        table.columns(3).search('')
                .draw();
        $('#database-select option:first').attr('selected','selected');
        $('#dd-dataset').hide();
    });  

    $(document.body).on('change','#dataset-select', function(){
            var val = $(this).val();
            table.columns(3)
                .search( val ? '^'+val+'$' : '', true, false )
                .draw();
    
    });  
    $(document.body).on('change','#database-select', function(){
        var val = $(this).val();
        var dataset_items=[];
        table.columns(3).search( '' )
             .draw();
        table.columns(2)
                .search( val ? '^'+val+'$' : '', true, false )
                .draw();

        if ( val === ""){
            $('#dd-dataset').hide();
        } else{
            dataset_items = table.cells({ search :'applied'}, 3).data().sort().unique();
            if(dataset_items.length > 1){
                $('#dd-dataset').show();
                $('#dataset-select').html('<option class="categoryFilter" value="">Show All</option>');
                dataset_items.each(
                    function (d) {
                        if(d !== ''){
                            $('#dataset-select').append('<option class="categoryFilter" value="'+d+'">'+d+'</option>');
                        }
                    }
                );
            } else {
                $('#dd-dataset').hide();
            }   
        }
    });  

    var database_items = table.columns(2).data().eq( 0 ).sort().unique();
    // removeA(dataset_items, '');
    $("div.toolbar").html('<b>Filter by:</b> Database: <select id="database-select"><option class="categoryFilter" value="">Show All</option></select>&nbsp;&nbsp;&nbsp;<span id="dd-dataset" style="display:none;">Dataset: <select id="dataset-select"><option class="categoryFilter" value="">Show All</option></select></span>&nbsp;&nbsp;&nbsp;<button id="filter-reset" class="btn-xs btn btn-info">Reset filters</button>');
    database_items.each(
        function (d) {
            if(d !== ''){
                $('#database-select').append('<option class="categoryFilter" value="'+d+'">'+d+'</option>');
            }   
        }
    );

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
        if(dataList[i].OWNER+"."+dataList[i].TABLE_NAME === data_item){    
            var di = dataList[i];
            $('#d-name').html(getName(di));
            var new_owner = (di.OWNER === 'IMGELEV') ? 'Imagery_Elevation' : di.OWNER;
            var ds = (di.FEATURE_DATATSET !== '') ? di.OWNER+'.'+di.FEATURE_DATATSET + '\\': '';
            $('#d-location').html('<span id="data-url" value="' + 'V:\\'+new_owner+'\\'+new_owner+'.sde\\'+ ds +di.OWNER+'.'+di.TABLE_NAME+ '">' + 'V:\\'+new_owner+'\\'+new_owner+'.sde\\'+ ds +di.OWNER+'.'+di.TABLE_NAME+ '</span>&nbsp;&nbsp;&nbsp;<button class="btn btn-xs btn-default" id="copy-button" data-clipboard-target="#data-url">Copy URL</button>');
            $('#d-dataset').html(getDatasetVal(di));
            $('#d-type').html(getType(di));
            $('#d-modified').html(di.MOD_DATE);
            $('#d-abstract').html(lookup(di, 'ABSTRACT'));   
            $('#d-purpose').html(lookup(di, 'PURPOSE'));
            $('#d-limits').html(lookup(di, 'USE_LIMIT'));
            populate_field_table(data_item, di.OWNER+"_"+di.TABLE_NAME);
            var copyCode = new Clipboard('#copy-button', {
                target: function(trigger) {
                    return trigger.previousElementSibling;
                }
            });
            copyCode.on('success', function(event) {
                event.clearSelection();
                event.trigger.textContent = 'Copied';
                window.setTimeout(function() {
                    event.trigger.textContent = 'Copy URL';
                }, 2000);
            });
        }
    }
}

function lookup(data, field){
    var attr_value = (!data[field] || data[field].length === 0) ? '<i>none provided</i>' : data[field];
    return attr_value;
}

function populate_field_table(dm, bd){
    $('#field-table').empty().html('').html('<tr><th>Field name</th><th>Alias</th><th>Description</th><th>Field type</th></tr>');
    for(var j = 0; j < fields.length; j++){
        if(dm === fields[j].OWNER+"."+fields[j].TABLE){
            var fi = fields[j];
            $('#field-table').append('<tr>'+
                '<td>'+fi.LABEL+'</td>'+
                '<td>'+fi.ALIAS+'</td>'+
                '<td>'+fi.DESC+'</td>'+
                '<td>'+fi.TYPE+'</td>'+
                '</tr>');
        }
    }
    if( bad_features.indexOf(bd) !== -1 ){
        console.log('hide column');
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
    if(tab_id !== ""){
        feature_details(tab_id);
    }else{
        show_table();
    }
    
});

 });
});