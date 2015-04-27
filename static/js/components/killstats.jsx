var React = require('react');
var moment = require('moment');

var KillStats = React.createClass({
    render: function() {
        if (this.props.kills) {
            var lastKill = this.props.kills[0].killTime;
            var firstKill = this.props.kills[this.props.kills.length-1].killTime;
            var killCount = this.props.kills.length;
            return (
                <div className="pure-g" style={{padding: 5, marginBottom: 10}}>
                    <div className="pure-u-1-5"><b>First kill</b>: { firstKill + ' (' + moment(firstKill).fromNow() + ')' }</div>
                    <div className="pure-u-1-5"><b>Last Kill</b>: { lastKill + ' (' + moment(lastKill).fromNow() + ')' }</div>
                    <div className="pure-u-1-5"><b>Total kills</b>: { killCount }</div>
                </div>
            );
        } else {
            return (
                <div></div>
            );
        }
    }
});

module.exports = KillStats;
