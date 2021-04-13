export function getClientHeight () {

  /**
   * Okay I know this seems kinda weird but there is some method
   * to the madness
   * 
   * We multiply the height by 0.75 because we only want the game to take
   * up the top 75% of the screen. This is because the 'morseboard' is set
   * to 25vh which is 25%, so overall we end up with 100%
   */

  return (document.body.clientHeight || window.innerHeight) * 0.75 
}
