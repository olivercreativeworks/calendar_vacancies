/**
 * @param {(events:Event[]) => Event[]} fn
 */
function testCalendarVacancies(fn = findVacancies){
  GASTEST.describe(fn.name, () => {
    const firstEvent = makeEvent({hour:9}, {hour:9})
    const lastEvent = makeEvent({hour:17}, {hour:17})
    const midDayEvent = makeEvent({hour: getRandomIntBetween(9, 12)}, {hour:getRandomIntBetween(13, 17)})
    const schedule = [firstEvent, lastEvent, midDayEvent]

    const vacancies = fn(schedule)

    GASTEST.describe("Vacancies should not overlap other events", () => {
      /** @param {Date} time @param {Event} event */
      const isDuringEvent = (time, event) => event.startTime < time && time < event.endTime

      GASTEST.test("Vacancies should not start during existing events", () => {
        const validVacancies = vacancies.filter(vacancy => {
          return schedule.every(event => !isDuringEvent(vacancy.startTime, event))
        })
        GASTEST.expectEquality(validVacancies, vacancies)
      })

      GASTEST.test("Vacancies should not end during existing events", () => {
        const validVacancies = vacancies.filter(vacancy => schedule.every(event => !isDuringEvent(vacancy.endTime, event)))
        GASTEST.expectEquality(validVacancies, vacancies)
      })
    })

    GASTEST.test("Vacancies should occur after the earliest event of the day", () => {
      const validVacancies = vacancies.filter(vacancy => firstEvent.endTime <= vacancy.startTime)
      GASTEST.expectEquality(validVacancies, vacancies)
    })

    GASTEST.test("Vacancies should occur before the latest event of the day", () => {
      const validVacancies = vacancies.filter(vacancy => vacancy.endTime <= lastEvent.startTime)
      GASTEST.expectEquality(validVacancies, vacancies)
    })

    GASTEST.test("Vacancy start times should be before end times", () => {
      const validVacancies = vacancies.filter(vacancy => vacancy.startTime < vacancy.endTime)
      GASTEST.expectEquality(validVacancies, vacancies)
    })

    GASTEST.test("There should be at least one vacancy", () => {
      const firstEvent = makeEvent({hour:9}, {hour:9})
      const lastEvent = makeEvent({hour:17}, {hour:17})
      const schedule = [firstEvent, lastEvent]
      const vacancies = fn(schedule)
      GASTEST.expectEquality(vacancies.length > 0, true)
    })

    GASTEST.test("There should be no vacancies", () => {
      const firstEvent = makeEvent({hour:9}, {hour:9})
      const lastEvent = makeEvent({hour:17}, {hour:17})
      const allDayEvent = makeEvent({hour:firstEvent.endTime.getHours()}, {hour:lastEvent.startTime.getHours()})
      const schedule = [firstEvent, lastEvent, allDayEvent]
      const vacancies = fn(schedule)
      GASTEST.expectEquality(vacancies, [])
    })
  })
}

function getRandomIntBetween(startExclusive, endExclusive){
  return startExclusive + getRandomInt(endExclusive - startExclusive - 1)

  /**
   * @param {number} max
   */
  function getRandomInt(max){
    return Math.ceil(Math.random() * max)
  }
}


/**
 * @param {{hour:number, minute?:number}} startTime
 * @param {{hour:number, minute?:number}} endTime
 * @return {Event}
 */
function makeEvent(startTime, endTime){
  return {startTime:makeTime(startTime), endTime:makeTime(endTime)}

  /**
   * @param {{hour:number, minute?:number}} time
   */
  function makeTime(time){
    return new Date(new Date().setHours(time.hour, time.minute || 0))
  }
}
