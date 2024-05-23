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

// Get blocks of events
// identify gaps between the blocks

/**
 * @param {Event[]} schedule
 * @return {Event[]}
 */
function findVacancies(schedule){
  /** @type {Event[]} */
  const events = schedule.toSorted(sortFromEarliestToLatest)
  console.log(events)
  const aggregate = events.slice(1).reduce((blocks, event, index) => {
    if(eventsOverlap(blocks.currentBlock, event)){
      const minTime = blocks.currentBlock.startTime < event.startTime ? blocks.currentBlock.startTime : event.startTime
      const maxTime = blocks.currentBlock.endTime > event.endTime ? blocks.currentBlock.endTime : event.endTime
      blocks.currentBlock = {
        startTime:  minTime,
        endTime: maxTime
      }
      return blocks
    }else{
      blocks.storedBlocks = blocks.storedBlocks.concat(blocks.currentBlock)
      blocks.currentBlock = event
      if(JSON.stringify(event) === JSON.stringify(events.at(-1))){
        blocks.storedBlocks = blocks.storedBlocks.concat(event)
      }
      return blocks
    }
  }, {storedBlocks:[], currentBlock: events[0]})
    .storedBlocks


  console.log(aggregate)

  const result = aggregate.slice(1).reduce((vacancies, event, index) => {
    const previousEvent = aggregate[index]
    return vacancies.concat(findVacancy(previousEvent, event))
  }, [])
    .filter(x => x)
  console.log(result)
  return result
}

/**
 * @param {Event} firstEvent
 * @param {Event} nextEvent
 * @return {Event} vacancy
 */
function findVacancy(firstEvent, nextEvent){
  if(firstEvent.endTime >= nextEvent.startTime) return undefined
  return {
    startTime: firstEvent.endTime,
    endTime:nextEvent.startTime
  }
}

/**
 * @param {Event} eventA
 * @param {Event} eventB
 */
function sortFromEarliestToLatest(eventA, eventB){
  return eventA.startTime - eventB.startTime
}




