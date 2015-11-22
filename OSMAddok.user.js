// ==UserScript==
// @name         OSMAddok
// @namespace    http://linuxw.info
// @homepage     https://github.com/gileri/
// @version      0.1
// @description  Add BAN (adresse.data.gouv.fr) results above Openstreetmap search results on openstreetmap.org
// @author       gileri
// @match        *://www.openstreetmap.org/
// @match        *://www.openstreetmap.org/search*
// @match        *://www.openstreetmap.org/node*
// @match        *://www.openstreetmap.org/way*
// @match        *://www.openstreetmap.org/relation*
// @match        *://www.openstreetmap.org/changeset*
// @match        *://www.openstreetmap.org/history*
// @match        *://www.openstreetmap.org/note*
// @match        *://www.openstreetmap.org/export*
// @grant        none
// ==/UserScript==
/* jshint -W097 */
'use strict';

var addokURL = "https://api-adresse.data.gouv.fr/search/";
var defaultZoom = 12;

function formatFeature(f) {
    var map_url = '#map=' + defaultZoom + '/' + OSM.mapParams().lat + '/' + OSM.mapParams().lon + '/';
    var pointer_url = '?mlat=' + OSM.mapParams().lat +'&mlon=' + OSM.mapParams().lon;
    var attr = {
       "data-lon"    : f.geometry.coordinates[0],
       "data-lat"    : f.geometry.coordinates[1],
       "data-prefix" : f.properties.type,
       "data-name"   : f.properties.name,
       "href"        : "/" + pointer_url + map_url
   };
   var a = $("<a>")
     .addClass("set_position")
     .attr(attr)
     .text(f.properties.name);
    return $("<p>")
             .text(capitalizeFirstLetter(f.properties.type) + " ")
             .addClass("inner12 search_results_entry clearfix")
             .append(a);
}

function capitalizeFirstLetter(string) {
    // http://stackoverflow.com/a/1026087
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function displayResults(json) {
    var results = $("<ul>");
    $.each(json.features, function (i, f) {
        results.append($("<li>").append(formatFeature(f)));
    });


    var addokHeader = $("#sidebar_content h4").first().clone();
    addokHeader.find("a")
        .attr("href", "//adresse.data.gouv.fr/")
        .text("Addok");

    addokHeader.insertAfter("#sidebar_content>h2");
    results.insertAfter(addokHeader);
}

function waitOSMResults(func, params) {
    // When searching another place from the query results, the Addok API may answer quicker than Nominatim/Geonames, 
    if($("#sidebar_content h4").length) {
        func.apply(this, [params]);
    } else {
        setTimeout(function () {waitOSMResults(func, params);}, 100);
    }
}

$(".search_form").submit(function () {
    var osmQuery = $("#query").val();
    $.get(addokURL, {q: osmQuery}, function (data) {waitOSMResults(displayResults, data)});
});

var osmQuery = $("#query").val();
$.get(addokURL, {q: osmQuery}, function (data) {waitOSMResults(displayResults, data); });
