/**
 * @param {(events:Event[]) => Event[]} fn
 */
function testCalendarVacancies(fn = findVacancies){
  GASTEST.describe(fn.name, () => {
    GASTEST.test('Vacancies should not overlap with existing events', () => {
      for(let i = 0; i < 100; i++){
        const events = Array.from({length: getRandomInt(10)}, _ => {
          const startHour = getRandomInt(12)
          return makeEvent({hour:startHour, minute:0}, {hour:startHour + getRandomInt(12), minute:0})
        })
        const vacancies = fn(events)
        console.log((events.toSorted(sortFromEarliestToLatest)))
        console.log((vacancies))
        const overlaps = vacancies.map(vacancy => [vacancy, events.find(event => eventsOverlap(vacancy, event))])
          .filter(overlaps => overlaps[1])
          .map(([e1, e2]) => ({vacancy: {start: e1.startTime.getHours(), end:e1.endTime.getHours()}, event: {start: e2.startTime.getHours(), end:e2.endTime.getHours()}}))
        console.log(overlaps)
        GASTEST.expect(overlaps).toEqual([])
      }
    })
  })
}

/**
 * @param {Event} firstEvent
 * @param {Event} nextEvent
 */
function eventsOverlap(firstEvent, nextEvent){
  return ((firstEvent.startTime < nextEvent.endTime) && (firstEvent.startTime >= nextEvent.startTime)) ||
    ((nextEvent.startTime < firstEvent.endTime) && (nextEvent.startTime >= firstEvent.startTime))
}

/**
 * @param {number} max
 */
function getRandomInt(max){
  return Math.ceil(Math.random() * max)
}

/**
 * @param {{hour:number, minute:number}} startTime
 * @param {{hour:number, minute:number}} endTime
 * @return {Event}
 */
function makeEvent(startTime, endTime){
  return {startTime:makeTime(startTime), endTime:makeTime(endTime)}
}

/**
 * @param {{hour:number, minute:number}} time
 */
function makeTime(time){
  return new Date(new Date().setHours(time.hour, time.minute))
}