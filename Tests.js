/**
 * @param {(events:Event[]) => Event[]} fn
 */
function testCalendarVacancies(fn = findVacancies){
  GASTEST.describe(fn.name, () => {
    GASTEST.test('Vacancies should not overlap with existing events', () => {
      for(let i = 0; i < 1000; i++){
        const events = Array.from({length: getRandomInt(10)}, _ => {
          const startHour = getRandomInt(12)
          const rand = getRandomInt(12)
          const endHour = startHour + rand
          if(startHour > endHour){
            Logger.log(startHour)
            Logger.log(endHour)
            Logger.log(rand)
            throw new Error("end is less than start")
          }
          return makeEvent({hour:startHour, minute:0}, {hour:endHour, minute:0})
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
 * @param {Event} eventA
 * @param {Event} eventB
 */
function eventsOverlap(eventA, eventB){
  return isBetweenExclusive(eventA.startTime , eventB.startTime, eventB.endTime) ||
  isBetweenExclusive(eventA.endTime , eventB.startTime, eventB.endTime) ||
  isBetweenExclusive(eventB.startTime, eventA.startTime, eventA.endTime) ||
  isBetweenExclusive(eventB.endTime, eventA.startTime, eventA.endTime)
}

/**
 * @param {Date} dateToTest
 * @param {Date} startDate
 * @param {Date} endDate
 */
function isBetweenExclusive(dateToTest, startDate, endDate){
  return startDate < dateToTest && dateToTest < endDate
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