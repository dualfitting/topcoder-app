(function() {
  'use strict';

  angular.module('tcUIComponents').directive('historyGraph', historyGraph);

  function historyGraph() {
    return {
      restrict: 'E',
      templateUrl: function(elem, attrs) {
        return 'directives/history-graph/history-graph.directive.html';
      },
      scope: {
        promise: '=',
        rating: '='
      },
      controller: ['$scope', HistoryGraphController]
    };
  }

  function HistoryGraphController($scope) {
    $scope.colors = [
      // grey
      {
        'color': '#7f7f7f',
        'darkerColor': '#656565',
        'start': 0,
        'end': 899
      },
      // green
      {
        'color': '#99cc09',
        'darkerColor': '#7aa307',
        'start': 900,
        'end': 1199
      },
      // blue
      {
        'color': '#09affe',
        'darkerColor': '#078ccb',
        'start': 1200,
        'end': 1499
      },
      // yellow
      {
        'color': '#f39426',
        'darkerColor': '#c2761e',
        'start': 1500,
        'end': 2199
      },
      // red
      {
        'color': '#fe0866',
        'darkerColor': '#cb0651',
        'start': 2200,
        'end': Infinity
      }
    ];
    var w       = 600,
        h       = 400,
        padding = { top: 20, right: 5, bottom: 30, left: 50 };

    activate();

    function activate() {
      $scope.promise.then(function(history) {

        var parseDate = d3.time.format.utc("%Y-%m-%dT%H:%M:%S.%LZ").parse;
        history.forEach(function(d) {
          d.ratingDate = parseDate(d.ratingDate);
        });

        var x = d3.time.scale()
                  .range([0 + padding.left, w + padding.left])
                  .domain(d3.extent(history, function(d) { return d.ratingDate; }));

        var y = d3.scale.linear()
                  .range([h + padding.top, padding.top])
                  .domain(d3.extent(history, function(d) { return d.newRating; }));


        function yAxis(ticks) {
          return d3.svg.axis()
                   .scale(y)
                   .ticks(ticks || 10)
                   .orient("left");
        }

        function xAxis(ticks) {
          return d3.svg.axis()
                   .scale(x)
                   .ticks(ticks || 10)
                   .orient("bottom");
        }

        var line = d3.svg.line()
                     .interpolate('cardinal')
                     .x(function(d) { return x(d.ratingDate); })
                     .y(function(d) { return y(d.newRating); })


        var svg = d3.select('.history-graph').append('svg')
            .attr('width', w + padding.left + padding.right)
            .attr('height', h + padding.top + padding.bottom)


        svg.append('rect')
           .attr('x', padding.left)
           .attr('y', padding.top)
           .attr('width', w)
           .attr('height', h)



        svg.append('g')
           .attr('class', 'x axis')
           .attr('transform', 'translate(0,' + (h + padding.top) +')')
           .call(xAxis());


        svg.append('g')
            .attr('class', 'y axis')
            .attr('transform', 'translate(' + padding.left + ')')
            .call(yAxis())

        svg.append('g')
           .attr('class', 'grid')
           .attr('transform', 'translate(0, ' + (h + padding.top) + ')')
           .call(
             xAxis(Math.round(w / 35)).tickSize(-h, 0, 0)
                     .tickFormat('')
           )

        svg.append('g')
           .attr('class', 'grid')
           .attr('transform', 'translate(' + padding.left + ',0)')
           .call(
             yAxis(Math.round(h / 30)).tickSize(-w, 0, 0)
                    .tickFormat('')
           )


        svg.append('path')
           .datum(history)
           .attr('class', 'line')
           .attr('d', line)

        svg.selectAll('circle')
           .data(history)
           .enter()
           .append('circle')
           .attr('cx', function(d) {
             return x(d.ratingDate);
           })
           .attr('cy', function(d) {
             return y(d.newRating);
           })
           .attr('fill', function(d) {
             return ratingToColor($scope.colors, d.newRating);
           })
           .on('mouseover', function(d) {
             $scope.historyRating = d.newRating;
             $scope.historyDate = moment(d.ratingDate).format('YYYY-MM-DD');
             $scope.historyChallenge = d.challengeName;
             $scope.$digest();
             d3.select(this)
               .attr('r', 4.0)
               .attr('stroke', 'black')
               .attr('stroke-width', '.5px');
           })
           .on('mouseout', function(d) {
             $scope.historyRating = undefined;
             $scope.$digest();
             d3.select(this)
               .attr('r', 3.0)
               .attr('stroke', 'none')
               .attr('stroke-width', '0px');
           })
           .attr('r', 3.0)

      });

    }

    function ratingToColor(colors, rating) {
      colors = colors.filter(function(color) {
        return rating >= color.start && rating <= color.end;
      });
      return colors[0] && colors[0].color || 'black';
    }

    function ratingToDarkerColor(colors, rating) {
      colors = colors.filter(function(color) {
        return rating >= color.start && rating <= color.end;
      });
      return colors[0] && colors[0].darkerColor || 'black';
    }
    
  }

})();
