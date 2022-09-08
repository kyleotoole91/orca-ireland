export class StringUtils {
  intToPositionText (positionInt) {
    let position = ''
    switch(positionInt) {
      case 1:
        position = positionInt+'st'
        break;
      case 2:
        position = positionInt+'nd'
        break;
      case 3:
        position = positionInt+'rd'
        break;
      default:
        position = positionInt+'th'
        break;
    }
    return position  
  }
}
