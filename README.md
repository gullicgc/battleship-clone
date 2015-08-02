# battleship-clone
Battleship App. created for scripting class. 
<br>Implemented using Hasbro official rules.
<br>Uses canvas for drawing template.
<br>Battle a strategic AI in a game of battleship.
<br><br>Implemented AI uses hunt and target modes for attacking.
   - Hunt mode: Searches for enemy ships by randomly attacking locations 
                in a single-spaced checkerboard pattern.
   - Target mode: Once a ship is hit, the AI tries to attack the coordinates around the
                  hit location. Once another hit is found for the same ship, the AI 
                  continues in a straight line until the ship is sunk. Any new ships found
                  during target mode are returned to after the initial ship is sunk.
