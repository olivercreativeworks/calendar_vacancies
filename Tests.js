/**
 * @param {(events:Event[]) => Event[]} fn
 */
function testFindVacancies(fn = findVacancies){
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

/**
 * @param {(events:Event[], workday:Event) => Event[]} fn
 */
function testFindWorkdayVacancies(fn = findWorkdayVacancies){
  GASTEST.describe(fn.name, () => {
    GASTEST.describe("Should handle multi-day events", () => {
      const workdate = new Date("5/24/2024")
      const workday = makeEvent({hour:9}, {hour:17}, workdate)
      GASTEST.test("Should return no vacancies", () => {
        const eventThatSpansEntireWorkdayIntoNextDay = {
          startTime: workday.startTime, 
          endTime: makeTime({hour:getRandomIntBetween(0, 24)}, new Date(new Date(workdate).setDate(workdate.getDate() + 1))) 
        }
        const events = [eventThatSpansEntireWorkdayIntoNextDay ]
        const vacancies = fn(events, workday)
        GASTEST.expectEquality(vacancies, [])
      })
      GASTEST.test("Should return at least one vacancy", () => {
        const eventThatSpansPartialWorkdayIntoNextDay = {
          startTime: makeTime({hour: workday.startTime.getHours() + 1}, workdate), 
          endTime: makeTime({hour:getRandomIntBetween(0, 24)}, new Date(new Date(workdate).setDate(workdate.getDate() + 1))) 
        }
        const events = [eventThatSpansPartialWorkdayIntoNextDay]
        const vacancies = fn(events, workday)
        GASTEST.expectEquality(vacancies.length >= 1, true)
      })
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
 * @param {Date} [forDate]
 * @return {Event}
 */
function makeEvent(startTime, endTime, forDate){
  return {startTime:makeTime(startTime, forDate), endTime:makeTime(endTime, forDate)}
}
/**
 * @param {{hour:number, minute?:number}} time
 * @param {Date} onDate
 */
function makeTime(time, onDate = new Date){
  return new Date(new Date(onDate).setHours(time.hour, time.minute || 0, 0, 0))
}
