# TEAM GFX Group Project #

_Xplore_

Team GFX

| Name | Student ID | Email | GitHub Handle |
| --- | --- | --- | --- |
| Nathan March | 404827938 | nathanzmarch@gmail.com | nathanzmarch |
| Akram Sabbah | 504751933 | akramsabbah9@gmail.com | akramsabbah9 |
| Alec Serrano Deneken | 804754567 | alecdeneken@gmail.com | alecdeneken |
| Matthew Valley | 704747855 | matthew.valley1@gmail.com | matthewvalley |

Representative: Nathan March

**Project General Overview**

Xplore is a minimalist adventure game where the player traverses through multiple landscapes to reach the end goal. The player is to wander through different scenes and interact with objects to trigger portals or checkpoints to travel between scenes. The game is intended to be relaxing and aesthetically pleasing.

**Gameplay**

Xplore&#39;s gameplay consists of moving the player around a three-dimensional space, with first-person view. The player can use the keyboard to move forwards, backwards, left or right. They can adjust their view by moving the mouse.

**How To Play**
Xplore is a minimalist adventure game where the player traverses through multiple landscapes to reach the end goal. WASD keys move the player around and mouse-picking adjusts the view perspective. Each level has a trigger that the player needs to stand on in order to transition into the next landscape. There are 6 levels total.

**Level Design**

Checkpoints will be differently-colored or otherwise unique objects in the scene that the player must move to in order to progress. After reaching a level&#39;s checkpoint, the player will be moved to the next level, with different aesthetics and scenery.

**How to Run**
Clone the repository.
For Windows run host.bat then go to localhost:8000 in the browser of your choice.
For Mac run host.command then go to localhost:8000 in the browser of your choice.

**Technical Details and Advanced Topics**

Collision Detection: Implemented to keep the player inside the game domain, and to keep it out of certain structures, such as trees, cacti and the pyramid. Collision detection was also used in the last level: if the player touched the lava floor, they would respawn at the beginning of the lava, and if they touched a purple obelisk, they would spawn a new platform to walk on.

Particle Simulation: Designed player-tracked snow particles to give the illusion of snowfall. Rather than drawing snow objects across the entire level, localizing the snowfall to the player location notably optimized runtime performance. Snow particles are first drawn at a set height and accelerated towards the ground. When a particle hits the floor, it is redrawn at its initial height again. This is then enhanced by adding several more particles to the operation. This loop of actions creates a seamless illusion of global snow.

Mouse Controls: To properly implement Xplore’s controls, the default Movement_Controls (in dependencies.js) were removed. The commands were re-written from the ground up to allow for camera rotation without any z-axis skew. This allowed the orientation of the camera matrix to stay aligned with the level. Javascript event listeners were also added to allow for click-and-drag mouse rotation. Our implementation only rotates the camera when the mouse is dragged in a direction, unlike the default Movement_Controls which rotates the camera as long as the mouse is slightly off-center.

**Citations**

Model Imports:

Fan Shell - https://www.turbosquid.com/FullPreview/Index.cfm/ID/1562122
Snail - https://www.turbosquid.com/FullPreview/Index.cfm/ID/1551575
Whale - https://www.turbosquid.com/3d-models/whale-swimming-animation-model-1560985
Turtle - http://www.cadnav.com/3d-models/model-47651.html