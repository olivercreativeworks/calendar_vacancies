/**
 * @return {void}
 */
function getVacancies() {
  const events = CalendarApp.getEvents(new Date("May 22, 2024"), new Date())

  const eventsByDate = events.reduce((group, event) => {
    const key = event.getStartTime().toDateString()
    const eventsArray = group[key] || []
    const entries = Object.fromEntries(
      [[key, eventsArray.concat({startTime:event.getStartTime(), endTime:event.getEndTime()})]]
    )
    return Object.assign({}, group, entries)
  }, {})

  /**
   * @type {[string, Event[]][]}
   */
  const schedulesByDate = Object.entries(eventsByDate).map(([key, schedule]) => {
    return [key, schedule.concat({startTime:new Date(new Date(key).setHours(12, 0, 0, 0)), endTime:new Date(new Date(key).setHours(13, 0, 0, 0))})]
  })

  console.log(schedulesByDate)
  
  const schedules = schedulesByDate.map(([dt, schedule]) => {
    console.log(schedule)
    return [dt, findWorkdayVacancies(schedule, {startTime: makeTime({hour:9}, new Date(dt)), endTime: makeTime({hour:17}, new Date(dt))})]
  })
  schedules.forEach(schedule => {
    console.log(schedule[0])
    console.log(schedule[1])
  })
}

/**
 * @param {Event[]} schedule
 * @param {Event} workday
 */
function findWorkdayVacancies(schedule, workday = {startTime:new Date(), endTime:makeTime({hour:23, minute:59}, new Date())}){
  const workdaySchedule = schedule
    .filter(event => workday.startTime <= event.endTime && event.startTime <= workday.endTime)
    .concat([
      {startTime:workday.startTime, endTime:workday.startTime},
      {startTime:workday.endTime, endTime:workday.endTime}
    ])
  return findVacancies(workdaySchedule)
}

/**
 * @typedef Event
 * @property {Date} startTime
 * @property {Date} endTime
 */

/**
 * @param {Event[]} schedule
 * @return {Event[]}
 */
function findVacancies(schedule){
  /** @type {Event[]} */
  const events = schedule.toSorted(sortFromEarliestToLatest)

  const eventBlocks = events.reduce(mergeEvents, [])

  const vacancies = eventBlocks.reduce(findGaps, [])

  return vacancies
}

/**
 * @param {Event} eventA
 * @param {Event} eventB
 */
function sortFromEarliestToLatest(eventA, eventB){
  return eventA.startTime - eventB.startTime
}

/**
 * @param {Event[]} blocks
 * @param {Event} event
 * @return {Event[]}
 */
function mergeEvents(blocks, event){
  /** @type {Event} */
  const mostRecentBlock = blocks.at(-1)

  if(mostRecentBlock && mostRecentBlock.endTime >= event.startTime){
    const mergedBlock = {
      startTime: mostRecentBlock.startTime, 
      endTime: new Date(Math.max(mostRecentBlock.endTime, event.endTime))
    }
    return blocks.with(-1, mergedBlock)
  }
  return blocks.concat(event)
}

/**
 * @param {Event[]} vacancies
 * @param {Event} event
 * @param {index} number
 * @param {Event[]} blocks
 * @return {Event[]}
 */
function findGaps(vacancies, event, index, blocks){
  /** @type {Event} */
  const nextEvent = blocks.at(index + 1)
  
  if(!nextEvent || event.endTime >= nextEvent.startTime) return vacancies
  const vacancy = {startTime: event.endTime, endTime: nextEvent.startTime}
  return vacancies.concat(vacancy)
}


/**
 * @param {Date} forDate
 * @param {Date} time
 */
function updateTime(forDate, time){
  return new Date(new Date(forDate).setHours(
    time.getHours(),
    time.getMinutes(),
    time.getSeconds(),
    time.getMilliseconds()
  ))
}