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
}
