# WebGL-Shapes-Tesselation-and-Twist

https://ammarnaqvi.github.io/WebGL-Shapes-Tesselation-and-Twist

• Basic Drawing
• Tessellation and Twist

A program that draws a user-selected primitive on the canvas using a user-selected
color and a size. User can pick a primitive like a triangle, or a square to draw. User then selects a
color for drawing and also chooses the size of the primitive. After that the primitive is drawn on
every mouse click. User can draw multiple objects choosing a primitive, its size and a color at
will.

dat.GUI for implementing all controls

Twist: It is the rotation of vertices depending upon how far they are from the origin. The further
a vertex is from the origin the greater it rotates. ‘d’ is the distance from the origin. Twist will be
implemented using a slider where user can select the angle.

x'= x cos(dθ) − y sin(dθ)
y'= x sin(dθ) + y cos(dθ)
d ∝ sqrt (x^2, y^2)

Tessellation: A triangle can be subdivided into multiple triangles. For example a triangle can
easily be divided into 4 sub triangles. In turn each triangle can be further divided into four more
and so on. The number of times each triangle will be divided depends on the user chosen
number.
