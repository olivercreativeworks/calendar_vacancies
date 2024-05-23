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
    .toSorted((a, b) => a.getStartTime() - b.getStartTime())

  const times2 = $events.slice(1).reduce((t, event, i) => {
    if($events[i].getEndTime() < event.getStartTime()){
      return t.concat([[$events[i].getEndTime(), event.getStartTime()]])
    }
    return t
  },[])

  Logger.log(times2)
  Logger.log(findVacancies($events.flatMap((time) => [{startTime:time.getStartTime(), endTime:time.getEndTime()}]) ))
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
  console.log(events)
  return events.slice(1).reduce((vacancies, event, index) =>{
    const previousEvent = events[index]
    console.log(findVacancy(previousEvent, event))
    return vacancies.concat(findVacancy(previousEvent, event))
  }, [])
    .filter(x => x)
}

/**
 * @param {Event} firstEvent
 * @param {Event} nextEvent
 * @return {Event} vacancy
 */
function findVacancy(firstEvent, nextEvent){
  if(eventsOverlap(firstEvent, nextEvent)) return undefined
  return {
    startTime:firstEvent.endTime,
    endTime:nextEvent.startTime
  }
}

/**
 * @param {Event} firstEvent
 * @param {Event} nextEvent
 */
function eventsOverlap(firstEvent, nextEvent){
  return firstEvent.endTime >= nextEvent.startTime
}

/**
 * @param {Event} eventA
 * @param {Event} eventB
 */
function sortFromEarliestToLatest(eventA, eventB){
  return eventA.startTime - eventB.startTime
}

function testMe(){
  Logger.log(undefined >= new Date())
  Logger.log(undefined <= new Date())
  const arr = []
  const ar2 = arr.concat(undefined).concat(3).concat(undefined).concat(4)
  Logger.log(ar2)
}



