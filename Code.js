/**
 * @return {void}
 */
function getVacancies() {
  const events = CalendarApp.getEventsForDay(new Date())
  
  const startOfDay = new Date(new Date().setHours(9, 0, 0, 0))
  const endOfDay = new Date(new Date().setHours(17, 0, 0, 0))
  const startLunch = new Date(new Date().setHours(12, 0, 0, 0))
  const endLunch = new Date(new Date().setHours(13, 0, 0, 0))

  const $events = events
    .concat([{getStartTime: () => startOfDay, getEndTime:() => startOfDay}])
    .concat([{getStartTime: () => startLunch, getEndTime:() => endLunch}])
    .concat([{getStartTime: () => endOfDay, getEndTime: () => endOfDay }])

  Logger.log(
    findVacancies($events.flatMap((time) => [{startTime:time.getStartTime(), endTime:time.getEndTime()}]) )
    )
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