function testingDates(){
  for(let i = 0; i < 30; i++){
    const today = new Date()
    const nextDate = new Date(today.setDate(today.getDate() + i))
    Logger.log(nextDate)
  }
}
function getVacancies() {
  const events = CalendarApp.getEventsForDay(new Date())
  
  const st = events.map(event => [event.getStartTime(), event.getEndTime()])
  st.forEach(e => Logger.log(e))
  const startOfDay = new Date().setHours(9, 0, 0, 0)
  const endOfDay = new Date().setHours(17, 0, 0, 0)
  const startLunch = new Date(new Date().setHours(12, 0, 0, 0))
  const endLunch = new Date(new Date().setHours(13, 0, 0, 0))
//	[[Wed May 15 10:00:00 GMT-04:00 2024, Wed May 15 12:30:00 GMT-04:00 2024], [Wed May 15 13:30:00 GMT-04:00 2024, Wed May 15 16:00:00 GMT-04:00 2024], [Wed May 15 16:45:00 GMT-04:00 2024, Wed May 15 17:00:00 GMT-04:00 2024]]
  Logger.log( new Date(startOfDay).toString())
  let times = []
  let freeTime = new Date(startOfDay)
  const $events = events.concat([{getStartTime: () => startLunch, getEndTime:() => endLunch}]).toSorted((a, b) => a.getStartTime() - b.getStartTime())
  for(let event of $events){
    if(freeTime < event.getStartTime()){
      times.push([freeTime, event.getStartTime()])
    }
    freeTime = event.getEndTime()
  }
  // Logger.log(freeTime)
  // Logger.log(new Date(endOfDay).toString())
  // Logger.log(freeTime < new Date(endOfDay))
  if(freeTime < new Date(endOfDay)){
    times.push([freeTime,  new Date(endOfDay)])
  }
  Logger.log(times)

}
