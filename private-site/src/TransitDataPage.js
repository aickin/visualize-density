import React from "react";
import { Dropdown, Table } from "semantic-ui-react";
import startCase from "lodash.startcase";

let agencyData
const allRoutesId = 'all-routes-at-this-agency'
const allDirections = 'all-directions-on-this-route'

const analysisHours = []
for (var i = 4; i <= 25; i++) {
  analysisHours.push(i)
}

function getBackgroundColor(frequency) {
  if (frequency <= 15) {
    return '#B82630'
  } else if (frequency <= 29) {
    return '#A866A6'
  } else if (frequency <= 59) {
    return '#779ECE'
  } else if (frequency <= 60) {
    return '#89C57C'
  } else {
    return ''
  }
}

function makeSorter(key) {
  return (a, b) => {
    // first try to sort based off of numbers
    const akInt = parseInt(a[key])
    const bkInt = parseInt(b[key])
    if (akInt < bkInt) return -1
    if (akInt > bkInt) return 1
    // comparison could've been NaNs, so do again with strings
    const akStr = ('' + a[key]).toLowerCase()
    const bkStr = ('' + b[key]).toLowerCase()
    if (akStr < bkStr) return -1
    if (akStr > bkStr) return 1
    return 0
  }
}

const dateTypeOptions = [{
  text: 'Weekday',
  value: 'weekday'
}, {
  text: 'Saturday',
  value: 'saturday'
}, {
  text: 'Sunday',
  value: 'sunday'
}]

class TransitDataPage extends React.Component {
  componentWillMount() {
    this.setState({
      agencyIdx: 0,
      agencyOptions: [],
      dateType: 'weekday',
      routeId: allRoutesId,
      routeOptions: []
    })
  }

  async componentDidMount() {
    agencyData = await fetch('/agency-data.json').then(res => res.json())
    this.setState({
      agencyOptions: agencyData.map((agency, idx) => {
        return {
          text: startCase(agency.agencyName),
          value: idx
        }
      }),
      routeOptions: this._getRouteOptions(agencyData[0])
    })
  }

  _getRouteOptions(agency) {
    if (!agency) return []
    const {dateType} = this.state
    const options = Object.entries(agency.debugDetails[dateType])
      .map(([routeId, {name}]) => {
        return {
          text: name,
          value: routeId
        }
      })
      .sort(makeSorter('text'))
    options.splice(0, 0, { text: 'All', value: allRoutesId })
    return options
  }

  _onAgencyChange = (e, data) => {
    const agencyIdx = data.value
    const agency = agencyData[agencyIdx]
    this.setState({
      agencyIdx,
      routeId: allRoutesId,
      routeOptions: this._getRouteOptions(agency),
      stopsByStopId: agency.stopsByStopId
    })
  }

  _onDateTypeChange = (e, data) => {
    this.setState({
      dateType: data.value
    })
  }

  _onRouteChange = (e, data) => {
    const directionOptions = [{
      text: 'All directions',
      value: allDirections
    }]
    const {agencyIdx, dateType} = this.state
    const routeId = data.value
    if (routeId !== allRoutesId) {
      Object.keys(agencyData[agencyIdx].debugDetails[dateType][routeId].directions)
        .forEach(directionId => {
          directionOptions.push({
            text: directionId,
            value: directionId
          })
        })
    }

    this.setState({
      directionId: allDirections,
      directionOptions,
      routeId
    })
  }

  _onDirectionChange = (e, data) => {
    this.setState({
      directionId: data.value
    })
  }

  _getRouteRows() {
    if (!agencyData) return []
    const {agencyIdx, dateType} = this.state
    return Object.values(agencyData[agencyIdx].debugDetails[dateType])
      .sort(makeSorter('name'))
  }

  _getDirectionRows() {
    const {agencyIdx, dateType, routeId} = this.state
    return Object.entries(agencyData[agencyIdx].debugDetails[dateType][routeId].directions)
      .map(([directionId, {maxStopCountByHour}]) => {
        return {
          maxStopCountByHour,
          name: directionId
        }
      })
  }

  _getStopRows() {
    const {agencyIdx, dateType, routeId, directionId} = this.state
    const agency = agencyData[agencyIdx]
    return Object.entries(agency.debugDetails[dateType][routeId].directions[directionId].stops)
      .map(([stopId, {stopCountByHour}]) => {
        return {
          maxStopCountByHour: stopCountByHour,
          name: agency.stopNames[stopId]
        }
      })
  }

  _renderTableBody() {
    const {routeId, directionId} = this.state
    let rows = []
    if (routeId === allRoutesId) {
      rows = this._getRouteRows()
    } else if (directionId === allDirections) {
      rows = this._getDirectionRows()
    } else {
      rows = this._getStopRows()
    }
    return rows.map(row =>
      <Table.Row>
        <Table.Cell>{row.name}</Table.Cell>
        {analysisHours.map(hour => {
          const stopCountByHour = row.maxStopCountByHour[hour]
          let stopText = ''
          const frequency = 60 / stopCountByHour
          if (stopCountByHour > 0) {
            stopText = Math.ceil(frequency)
          }
          return (
            <Table.Cell
              style={{backgroundColor: getBackgroundColor(frequency)}}
              >
              {stopText}
            </Table.Cell>
          )
        })}
      </Table.Row>
    )
  }

  render() {
    const {
      agencyIdx,
      agencyOptions,
      dateType,
      routeId,
      routeOptions,
      directionId,
      directionOptions
    } = this.state
    const rowHeader = (
      routeId === allRoutesId
        ? 'Route'
        : directionId === allDirections
          ? 'Direction'
          : 'Stop'
    )
    return (
      <div>
        <div style={{ margin: 10 }}>
          <label>Agency:</label>
          <Dropdown
            selection
            options={agencyOptions}
            value={agencyIdx}
            onChange={this._onAgencyChange}
            style={{ margin: '0 10px' }}
          />
          <label>Date Type:</label>
          <Dropdown
            selection
            options={dateTypeOptions}
            value={dateType}
            onChange={this._onDateTypeChange}
            style={{ margin: '0 10px' }}
          />
          <label>Route:</label>
          <Dropdown
            selection
            options={routeOptions}
            value={routeId}
            onChange={this._onRouteChange}
            style={{ margin: '0 10px' }}
          />
          {routeId !== allRoutesId &&
            <React.Fragment>
              <label>Direction:</label>
              <Dropdown
                selection
                options={directionOptions}
                value={directionId}
                onChange={this._onDirectionChange}
                style={{ margin: '0 10px' }}
              />
            </React.Fragment>
          }
        </div>
        <div className='tables'>
          <Table celled structured>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell
                  rowSpan='2'
                  >
                  {rowHeader}
                </Table.HeaderCell>
                <Table.HeaderCell
                  colSpan={analysisHours.length}
                  textAlign='center'
                  >
                  {startCase(dateType)}
                </Table.HeaderCell>
              </Table.Row>
              <Table.Row>
                {analysisHours.map(hour =>
                  <Table.HeaderCell>{hour}</Table.HeaderCell>
                )}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {this._renderTableBody()}
            </Table.Body>
          </Table>
        </div>
      </div>
    )
  }
}

export default TransitDataPage
