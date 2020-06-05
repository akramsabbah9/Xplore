window.Xplore = window.classes.Xplore =
    class Xplore extends Scene_Component {
        constructor(context, control_box) {
            // The scene begins by requesting the camera, shapes, and materials it will need.
            super(context, control_box);
            // First, include a secondary Scene that provides movement controls:
            //if (!context.globals.has_controls)
                //context.register_scene_component(new Movement_Controls(context, control_box.parentElement.insertCell()));

            const r = context.width / context.height;

            context.globals.graphics_state.camera_transform = Mat4.translation([0, -5, 3]);  // Locate the camera here (inverted matrix).
            this.ctrans = Mat4.inverse( context.globals.graphics_state.camera_transform ); // transformation matrix for camera
            context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI / 4, r, .1, 1000);

            this.current_level = 1;
            this.lava_stage = 0;
            this.minDomain = [-195,-395];
            this.maxDomain = [195,-5];

            const shapes = {
                'box': new Cube(),
                'square': new Square(),
                'border': new Border(),
                'ground': new Ground(),
                'triangle': new Triangle(),
                'pyramid': new Pyramid(),
                'sphere': new Subdivision_Sphere(4),
                'pyr1': new SandCube(),
                'pyr2': new SandCube(),
                'pyr3': new SandCube(),
                'pyr4': new SandCube(),
                'pyr5': new SandCube()
            };

            shapes.pyr1.texture_coords = shapes.pyr1.texture_coords.map(v => Vec.of(v[0] * 10, v[1] * 1));
            shapes.pyr2.texture_coords = shapes.pyr2.texture_coords.map(v => Vec.of(v[0] * 8, v[1] * 1));
            shapes.pyr3.texture_coords = shapes.pyr3.texture_coords.map(v => Vec.of(v[0] * 6, v[1] * 1));
            shapes.pyr4.texture_coords = shapes.pyr4.texture_coords.map(v => Vec.of(v[0] * 4, v[1] * 1));
            shapes.pyr5.texture_coords = shapes.pyr5.texture_coords.map(v => Vec.of(v[0] * 2, v[1] * 1));

            this.materials = {

                white: context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), {ambient: 1,}),
                black: context.get_instance(Phong_Shader).material(Color.of(1, 1, 1, 1)),
                blue: context.get_instance(Phong_Shader).material(Color.of(.3, .3, 1, 1)),
                bark:     context.get_instance( Phong_Shader ).material( Color.of( 0.55,0.27,0.08,1 )),
                green1:   context.get_instance( Phong_Shader ).material( Color.of( 0,0.3,0.1,1 ), {ambient: 0.2}),
                green2:   context.get_instance( Phong_Shader ).material( Color.of( 0,0.4,0.1,1 ), {ambient: 0.4}),
                green3:   context.get_instance( Phong_Shader ).material( Color.of( 0,0.6,0.2,1 ), {ambient: 0.6}),
                fire1:    context.get_instance( Phong_Shader ).material( Color.of( 1,0,0,1 ), {ambient: 1, specularity:0}),
                fire2:    context.get_instance( Phong_Shader ).material( Color.of( 1,0.5,0,1 ), {ambient: 1, specularity:0, diffusivity:0}),
                fire3:    context.get_instance( Phong_Shader ).material( Color.of( 1,1,0,1 ), {ambient: 1, specularity:0}),
                sand:     context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), {ambient: 1, specularity:1}),
                dunes:    context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), {ambient: 1, specularity:1}),
                sunHalo:  context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), {ambient: 1, specularity:1}),
                pyr:      context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), {
                        ambient: 1, 
                        texture: context.get_instance("assets/AztecTexture.jpg")}),
                bird:     context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 )),
                path:     context.get_instance( Phong_Shader ).material( Color.of( 0.2,0.3,0.3,1), {ambient: 0.1, specularity:1}),
                sky: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), { ambient: 1, diffusivity: .3 }),
                glass:    context.get_instance(Phong_Shader).material(Color.of(1, 1, 1, 0.7)),
                lava:     context.get_instance(Texture_Scroll_X).material(Color.of(0, 0, 0, 1), 
                                                    {ambient: 1, texture: context.get_instance("assets/lava.jpg", false)} ),
                mtn:      context.get_instance(Phong_Shader).material(Color.of(0.8, 0.5, 0.3, 1), {ambient: .1}),
                
            };

            this.textures = {
                snow: this.materials.white.override({texture: context.get_instance('assets/snow.jpg')}),
                snow2: this.materials.white.override({texture: context.get_instance('assets/snow2.jpg')}),
                ice: this.materials.white.override({texture: context.get_instance('assets/ice.jpg')}),
                grass: this.materials.white.override({texture: context.get_instance("assets/grass.jpg")}),
                sky: this.materials.white.override({texture: context.get_instance('assets/sky_texture.jpg')}),
                mountains: this.materials.white.override({texture: context.get_instance('assets/mountains.jpg')}),
                snow_bg: this.materials.white.override({texture: context.get_instance('assets/snow_bg.png')}),
                snow_leaves: this.materials.white.override({texture: context.get_instance('assets/snow_leaves.jpg')}),
                bark: this.materials.white.override({texture: context.get_instance('assets/bark.jpg')}),
                bark2: this.materials.white.override({texture: context.get_instance('assets/bark2.jpg')}),
                leather: this.materials.white.override({texture: context.get_instance('assets/leather.jpg')}),
                clouds: this.materials.white.override({texture: context.get_instance('assets/cloudy.jpg')}),
                fire: this.materials.white.override({texture: context.get_instance('assets/fire.jpg')}),
                fire2: this.materials.white.override({texture: context.get_instance('assets/fire2.jpg')}),
                bruins: this.materials.white.override({texture: context.get_instance('assets/bruins.jpg')}),
                nebula: this.materials.sky.override({texture: context.get_instance('assets/night.jpg')}),
                glass: this.materials.glass.override({texture: context.get_instance('assets/glass.jpg')})
            }

            // At the beginning of our program, load one of each of these shape
            // definitions onto the GPU.  NOTE:  Only do this ONCE per shape
            // design.  Once you've told the GPU what the design of a cube is,
            // it would be redundant to tell it again.  You should just re-use
            // the one called "box" more than once in display() to draw
            // multiple cubes.  Don't define more than one blueprint for the
            // same thing here.
            this.submit_shapes(context, shapes);

            this.sand_texture = this.materials.sand.override({texture: context.get_instance("assets/sand.jpg")});
            this.dune_texture = this.materials.dunes.override({texture: context.get_instance('assets/dunes.jpg')});
            this.sunHalo_texture = this.materials.sunHalo.override({texture: context.get_instance('assets/sunHalo.jpg')});
            this.clay = context.get_instance(Phong_Shader).material(Color.of(.9, .5, .9, 1), { ambient: .4, diffusivity: .4 });
            this.plastic = this.clay.override({specularity: .6});


            this.lights = [new Light(Vec.of(0, 50, -200, 1), Color.of(1, 1, 1, 1), 100000)];


            this.randomX =  [...Array(100)].map(() => Math.floor(300*Math.random() + -150));
            this.randomZ =  [...Array(100)].map(() => Math.floor(300*Math.random() + -370));
            // 100 random tree sizes
            this.randomSize = [...Array(100)].map(() => Math.floor(10*Math.random() + 5));

            // initialize movement vars & listeners
            this.movx = this.movz = 0;
            this.rotv = this.roth = 0;
            this.m_rv = this.m_rh = 0; // mouse rotation variables
            this.ud = this.rd = Mat4.identity(); // undo/redo vertical rotation

            // listeners use 2 vars to avoid race conditions
            context.canvas.addEventListener("mousedown", e => {
                e.preventDefault();
                this.mouse_pos = this.mouse_position(e, context.canvas);
                this.mouse_down = true;
            });
            document.addEventListener("mouseup", e => {
                this.mouse_down = false;
            });
            context.canvas.addEventListener("mousemove", e => {
                e.preventDefault();
                if (this.mouse_down) this.update_mouse(e, context.canvas);
            });
        }

        make_control_panel()
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        {
            this.key_triggered_button( "Move Forward",  [ "w" ], () => this.movz = -1, () => undefined, () => this.movz = 0 );
            this.key_triggered_button( "Move Backward",  [ "s" ], () => this.movz = 1, () => undefined, () => this.movz = 0 );
            this.new_line();
            this.key_triggered_button( "Move Left",  [ "a" ], () => this.movx = -1, () => undefined, () => this.movx = 0 );
            this.key_triggered_button( "Move Right",  [ "d" ], () => this.movx = 1, () => undefined, () => this.movx = 0 );
            this.new_line();
            this.key_triggered_button( "Look Upwards",  [ "i" ], () => this.rotv = 1, () => undefined, () => this.rotv = 0 );
            this.key_triggered_button( "Look Downwards",  [ "k" ], () => this.rotv = -1, () => undefined, () => this.rotv = 0 );
            this.new_line();
            this.key_triggered_button( "Look Left",  [ "j" ], () => this.roth = 1, () => undefined, () => this.roth = 0 );
            this.key_triggered_button( "Look Right",  [ "l" ], () => this.roth = -1, () => undefined, () => this.roth = 0 );
        }

        drawGround(x, y, z, size, texture) {
            let model_transform = Mat4.identity().times(Mat4.translation([x,y,z]));
            model_transform = model_transform.times(Mat4.scale([size, 1, size]));
            this.shapes.ground.draw(this.globals.graphics_state, model_transform, texture);

        }

        drawTree(x, z, height) {
            let loc = Mat4.identity().times(Mat4.translation([x,0,z]));

            let trunk_transform = loc.times(Mat4.scale([1,height,1]));

            let leaves_bottom_transform = loc.times(Mat4.translation([0,.8*height,0]))
                                            .times(Mat4.scale([1.5*height,1*height,1.5*height]));

            let leaves_middle_transform = loc.times(Mat4.translation([0,1.2*height,0]))
                                            .times(Mat4.scale([1.3*height,1*height,1.3*height]));

            let leaves_top_transform = loc.times(Mat4.translation([0,1.6*height,0]))
                                        .times(Mat4.scale([1*height,1*height,1*height]));

            this.shapes.box.draw(this.globals.graphics_state, trunk_transform, this.textures.bark);
            this.shapes.pyramid.draw(this.globals.graphics_state, leaves_bottom_transform, this.materials.green1);
            this.shapes.pyramid.draw(this.globals.graphics_state, leaves_middle_transform, this.materials.green2);
            this.shapes.pyramid.draw(this.globals.graphics_state, leaves_top_transform, this.materials.green3);

        }

        drawPyramid(x, z) {           
            let t =  this.globals.graphics_state.animation_time / 1000;
            let location = Mat4.identity().times(Mat4.translation([x,5,z]));            

            let tier1 = location.times(Mat4.scale([50,5,50]));
            let tier2 = location.times(Mat4.translation([0,10,0])).times(Mat4.scale([40,5,40]));
            let tier3 = location.times(Mat4.translation([0,20,0])).times(Mat4.scale([30,5,30]));
            let tier4 = location.times(Mat4.translation([0,30,0])).times(Mat4.scale([20,5,20]));
            let tier5 = location.times(Mat4.translation([0,40,0])).times(Mat4.scale([10,5,10]));
            let gem = location.times(Mat4.translation([0,-3,0])).times(Mat4.rotation(t, Vec.of(0,1,0))).times(Mat4.scale([4,4,4]));

            this.shapes.pyr1.draw(this.globals.graphics_state, tier1, this.materials.pyr);
            this.shapes.pyr2.draw(this.globals.graphics_state, tier2, this.materials.pyr);
            this.shapes.pyr3.draw(this.globals.graphics_state, tier3, this.materials.pyr);
            this.shapes.pyr4.draw(this.globals.graphics_state, tier4, this.materials.pyr);
            this.shapes.pyr5.draw(this.globals.graphics_state, tier5, this.materials.pyr);
            this.shapes.pyramid.draw(this.globals.graphics_state, gem, this.materials.green3);

            let pathWay = Mat4.identity().times(Mat4.translation([x+50/2,5,z])).times(Mat4.scale([25.1,4.5,5]));
            this.shapes.pyr1.draw(this.globals.graphics_state, pathWay, this.materials.path);

            let minX = x - 52, maxX = x + 52, minZ = z - 52, maxZ = z + 52;
            let pathWall1 = minZ+54, pathWall2 = minZ+52, pathWall3 = minX + 40;
            this.boundingBox(minX,maxX,pathWall1,maxZ);
            this.boundingBox(minX,maxX,minZ,pathWall2);
            this.boundingBox(minX,pathWall3,minZ,maxZ);
        }

        boundingBox(minX,maxX,minZ,maxZ) {
            let cam_x = this.ctrans[0][3]
            let cam_z = this.ctrans[2][3]

            if ( cam_x > minX && cam_x < maxX && cam_z > minZ && cam_z < maxZ) {
                
                if ((maxX-cam_x) <= (cam_x-minX)) {
                   this.ctrans[0][3] = this.ctrans[0][3]+1;     
                }
                else {
                   this.ctrans[0][3] = this.ctrans[0][3]-1;     
                }

                if ((maxZ-cam_z) <= (cam_z-minZ)) {
                   this.ctrans[2][3] = this.ctrans[2][3]+1;     
                }
                else {
                   this.ctrans[2][3] = this.ctrans[2][3]-1;  
                }
                
            } 

        }

        drawForest() {
            var i;
            // Draw 10 trees on each side to make a path
            for (i = 0; i < 10; i++) {
                this.drawTree( 8,  i*-7,  5)
                this.drawTree(-8, i*-7,  5)
                // Draw 5 trees to close path behind character
                if (i%2 == 0) {
                    this.drawTree(1.8*i - 8, 0, 10);
                }
            }

            // Draw 50 tress in "random" places, in area (-150 < x < 150   and    370 < z < 70)
            var j;
            for (j = 0; j < 50; j++) {
                this.drawTree(this.randomX[j], this.randomZ[j], this.randomSize[j]);
            }
            
            this.drawFire(-100, 0, -280);

        }

        drawFire(x, y, z) {
            // Draw a fire at (x = -100, y = 0, z = -280 )
            let loc = Mat4.identity().times(Mat4.translation([x, y, z]).times(Mat4.scale([1.5,1.5,1.5])))

            let wood1 = loc.times(Mat4.rotation(0.78, Vec.of(0,1,0)))
                .times(Mat4.scale([3,0.5,0.5]));

            let wood2 = loc.times(Mat4.rotation(-0.78, Vec.of(0,1,0)))
                .times(Mat4.scale([3,0.5,0.5]));

            const t = this.globals.graphics_state.animation_time / 1000;
            let fireSize1 = 2 +   0.5*Math.sin(10*t);
            let fireSize2 = 1 + 0.3*Math.sin(25*(t-1));
            let fireSize3 = 0.6 + 0.2*Math.sin(40*(t-2));

            let fire1 = loc.times(Mat4.translation([0.3,0.5,-0.3]))
                .times(Mat4.scale([1,fireSize1,1]));

            let fire2 = loc.times(Mat4.translation([-0.3,0.5,-0.3]))
                .times(Mat4.scale([1,fireSize2,1]));

            let fire3 = loc.times(Mat4.translation([0,0.5,0.3]))
                .times(Mat4.scale([1,fireSize3,1]));


            this.shapes.box.draw(this.globals.graphics_state, wood1, this.textures.bark)
            this.shapes.box.draw(this.globals.graphics_state, wood2, this.textures.bark)
            this.shapes.pyramid.draw(this.globals.graphics_state, fire1, this.textures.fire)
            this.shapes.pyramid.draw(this.globals.graphics_state, fire2, this.textures.fire)
            this.shapes.pyramid.draw(this.globals.graphics_state, fire3, this.textures.fire)

        }

        drawVulture() {
                const t = this.globals.graphics_state.animation_time / 5000
                let angle1 = t;

          let wingRight = Mat4.identity().times(Mat4.translation([0,40,-200])).times(Mat4.rotation(angle1, Vec.of(0,1,0)))
                .times(Mat4.translation([30,0,0])).times(Mat4.rotation(0.25, Vec.of(0,0,1))).times(Mat4.scale([1,0.05,0.5]));
          
          let wingLeft = Mat4.identity().times(Mat4.translation([0,40,-200])).times(Mat4.rotation(angle1, Vec.of(0,1,0)))
                .times(Mat4.translation([28,0,0])).times(Mat4.rotation(-0.25, Vec.of(0,0,1))).times(Mat4.scale([1,0.05,0.5]));                         
          
          let wingTipRight = Mat4.identity().times(Mat4.translation([0,40,-200])).times(Mat4.rotation(angle1, Vec.of(0,1,0)))
                 .times(Mat4.translation([31.2,0,0])).times(Mat4.rotation(-.4, Vec.of(0,0,1)))
                 .times(Mat4.translation([-.3,0,0])).times(Mat4.scale([0.05,1,1]));
          
          let wingTipLeft = Mat4.identity().times(Mat4.translation([0,40,-200])).times(Mat4.rotation(angle1, Vec.of(0,1,0)))
                 .times(Mat4.translation([26.8,0,0])).times(Mat4.rotation(.4, Vec.of(0,0,1)))
                 .times(Mat4.translation([.3,0,0])).times(Mat4.scale([0.05,1,1]));

          let wingRight2 = Mat4.identity().times(Mat4.translation([0,35,-100])).times(Mat4.rotation(3*angle1+2, Vec.of(0,1,0)))
                .times(Mat4.translation([15,0,0])).times(Mat4.rotation(0.7, Vec.of(0,0,1))).times(Mat4.scale([1,0.05,0.5]));
          
          let wingLeft2 = Mat4.identity().times(Mat4.translation([0,34.2,-100])).times(Mat4.rotation(3*angle1+2, Vec.of(0,1,0)))
                .times(Mat4.translation([13.3,0,0])).times(Mat4.rotation(0.2, Vec.of(0,0,1))).times(Mat4.scale([1,0.05,0.5]));                         
          
          let wingTipRight2 = Mat4.identity().times(Mat4.translation([0,35,-100])).times(Mat4.rotation(3*angle1+2, Vec.of(0,1,0)))
                 .times(Mat4.translation([16,0.6,0])).times(Mat4.rotation(-.1, Vec.of(0,0,1)))
                 .times(Mat4.translation([-.2,0,0])).times(Mat4.scale([0.05,1,1]));
          
          let wingTipLeft2 = Mat4.identity().times(Mat4.translation([0,35,-100])).times(Mat4.rotation(3*angle1+2, Vec.of(0,1,0)))
                 .times(Mat4.translation([12.15,-1.2,0])).times(Mat4.rotation(1, Vec.of(0,0,1)))
                 .times(Mat4.translation([.3,0,0])).times(Mat4.scale([0.05,1,1]));

          let wingRight3 = Mat4.identity().times(Mat4.translation([0,35,-300])).times(Mat4.rotation(3*angle1, Vec.of(0,1,0)))
                .times(Mat4.translation([15,0,0])).times(Mat4.rotation(0.7, Vec.of(0,0,1))).times(Mat4.scale([1,0.05,0.5]));
          
          let wingLeft3 = Mat4.identity().times(Mat4.translation([0,34.2,-300])).times(Mat4.rotation(3*angle1, Vec.of(0,1,0)))
                .times(Mat4.translation([13.3,0,0])).times(Mat4.rotation(0.2, Vec.of(0,0,1))).times(Mat4.scale([1,0.05,0.5]));                         
          
          let wingTipRight3 = Mat4.identity().times(Mat4.translation([0,35,-300])).times(Mat4.rotation(3*angle1, Vec.of(0,1,0)))
                 .times(Mat4.translation([16,0.6,0])).times(Mat4.rotation(-.1, Vec.of(0,0,1)))
                 .times(Mat4.translation([-.2,0,0])).times(Mat4.scale([0.05,1,1]));
          
          let wingTipLeft3 = Mat4.identity().times(Mat4.translation([0,35,-300])).times(Mat4.rotation(3*angle1, Vec.of(0,1,0)))
                 .times(Mat4.translation([12.15,-1.2,0])).times(Mat4.rotation(1, Vec.of(0,0,1)))
                 .times(Mat4.translation([.3,0,0])).times(Mat4.scale([0.05,1,1]));
                                  

          this.shapes.pyr1.draw(this.globals.graphics_state, wingRight, this.materials.bird)
          this.shapes.pyr1.draw(this.globals.graphics_state, wingLeft, this.materials.bird)
          this.shapes.pyramid.draw(this.globals.graphics_state, wingTipRight, this.materials.bird)
          this.shapes.pyramid.draw(this.globals.graphics_state, wingTipLeft, this.materials.bird)
          this.shapes.pyr1.draw(this.globals.graphics_state, wingRight2, this.materials.bird)
          this.shapes.pyr1.draw(this.globals.graphics_state, wingLeft2, this.materials.bird)
          this.shapes.pyramid.draw(this.globals.graphics_state, wingTipRight2, this.materials.bird)
          this.shapes.pyramid.draw(this.globals.graphics_state, wingTipLeft2, this.materials.bird)
          this.shapes.pyr1.draw(this.globals.graphics_state, wingRight3, this.materials.bird)
          this.shapes.pyr1.draw(this.globals.graphics_state, wingLeft3, this.materials.bird)
          this.shapes.pyramid.draw(this.globals.graphics_state, wingTipRight3, this.materials.bird)
          this.shapes.pyramid.draw(this.globals.graphics_state, wingTipLeft3, this.materials.bird)          
        }

        drawCactus(x,z) {
            let height = 10;

            let loc = Mat4.identity().times(Mat4.translation([x,height/2,z]));

            let stem = loc.times(Mat4.scale([0.5,height,0.5]));

            let fork1 = loc.times(Mat4.rotation(2, Vec.of(0,1,0)))
                          .times(Mat4.translation([0.15*height,3,0]))                          
                          .times(Mat4.scale([0.15*height,0.5,0.5]));
            let end1 = loc.times(Mat4.rotation(2, Vec.of(0,1,0)))
                          .times(Mat4.translation([3,5,0]))  
                          .times(Mat4.scale([0.5,2.5,0.5]));   
            let fork2 = loc.times(Mat4.rotation(4.1, Vec.of(0,1,0)))
                          .times(Mat4.translation([2,1,0]))                          
                          .times(Mat4.scale([2,0.5,0.5]));
            let end2 = loc.times(Mat4.rotation(4.1, Vec.of(0,1,0)))
                          .times(Mat4.translation([3.5,4,0]))  
                          .times(Mat4.scale([0.5,2.5,0.5]));                
            let fork3 = loc.times(Mat4.rotation(0, Vec.of(0,1,0)))
                          .times(Mat4.translation([1.5,-2,0]))                          
                          .times(Mat4.scale([1.5,0.5,0.5]));
            let end3 = loc.times(Mat4.rotation(0, Vec.of(0,1,0)))
                          .times(Mat4.translation([3,1.5,0]))  
                          .times(Mat4.scale([0.5,4,0.5])); 

            this.shapes.pyr1.draw(this.globals.graphics_state, stem, this.materials.green3);
            this.shapes.pyr1.draw(this.globals.graphics_state, fork1, this.materials.green3);
            this.shapes.pyr1.draw(this.globals.graphics_state, end1, this.materials.green3);
            this.shapes.pyr1.draw(this.globals.graphics_state, fork2, this.materials.green3);
            this.shapes.pyr1.draw(this.globals.graphics_state, end2, this.materials.green3);
            this.shapes.pyr1.draw(this.globals.graphics_state, fork3, this.materials.green3);
            this.shapes.pyr1.draw(this.globals.graphics_state, end3, this.materials.green3);            
        }


        drawBorder(x, y, z, size, height, texture){
            let loc = Mat4.translation([x,y,z])
            loc = loc.times(Mat4.scale([size, height, size]))
            this.shapes.border.draw(this.globals.graphics_state, loc, texture)
        }


        drawLevelOne(){
            this.drawGround(0, 0, -200, 400, this.textures.grass);
            this.drawForest();
            this.drawGround(0, 50, -200, 400, this.textures.sky)

            this.drawBorder(0, -10, -200, 400, 100, this.textures.mountains)

            let cam_x = this.ctrans[0][3]
            let cam_z = this.ctrans[2][3]

            if (cam_x < -97 && cam_x > -103 && cam_z < -277 && cam_z > -283){
                this.reset_camera(0, -5, 3);
                this.current_level = 2;
            }
        }

        drawSnowyTree(x, z, height) {
            let loc = Mat4.identity().times(Mat4.translation([x,0,z]));

            let trunk_transform = loc.times(Mat4.scale([1,height,1]));

            let leaves_bottom_transform = loc.times(Mat4.translation([0,.8*height,0]))
                .times(Mat4.scale([1.5*height,1*height,1.5*height]));

            let leaves_middle_transform = loc.times(Mat4.translation([0,1.2*height,0]))
                .times(Mat4.scale([1.3*height,1*height,1.3*height]));

            let leaves_top_transform = loc.times(Mat4.translation([0,1.6*height,0]))
                .times(Mat4.scale([1*height,1*height,1*height]));

            this.shapes.box.draw(this.globals.graphics_state, trunk_transform, this.textures.bark);
            this.shapes.pyramid.draw(this.globals.graphics_state, leaves_bottom_transform, this.textures.snow_leaves);
            this.shapes.pyramid.draw(this.globals.graphics_state, leaves_middle_transform, this.textures.snow_leaves);
            this.shapes.pyramid.draw(this.globals.graphics_state, leaves_top_transform, this.textures.snow_leaves);

        }

        drawSnow(height, size, speed, texture){
            let t = (this.globals.graphics_state.animation_time / 1000) % (height/speed);
            let cam_x = this.ctrans[0][3];
            let cam_z = this.ctrans[2][3];

            let snow_height = height - speed*t;
            let fall_transform = Mat4.translation([cam_x - size/2, snow_height, cam_z + size/2]);

            var x,z;
            let trans_transform = fall_transform
            for (x = 0; x < size; x++){
                trans_transform = fall_transform.times(Mat4.translation([x, 0, 0]))
                for (z = 0; z > -size; z--){
                    trans_transform = trans_transform.times(Mat4.translation([0, 0, -1]))
                    this.shapes.box.draw(this.globals.graphics_state, trans_transform.times(Mat4.scale([.1,.1,.1])), texture)
                }
            }
        }

        drawSnowman(x, z, size, hat){
            let gs = this.globals.graphics_state;
            let model_transform = Mat4.translation([x, size, z]);
            model_transform = model_transform.times(Mat4.scale([size, size, size]));

            //body
            this.shapes.sphere.draw(gs, model_transform, this.textures.snow2)
            model_transform = model_transform.times(Mat4.translation([0, 1.6, 0]))
            this.shapes.sphere.draw(gs, model_transform, this.textures.snow2)
            model_transform = model_transform.times(Mat4.translation([0, 1.6, 0]))
            this.shapes.sphere.draw(gs, model_transform, this.textures.snow2)

            //eyes
            model_transform = model_transform.times(Mat4.scale([.1, .1, .1]));
            model_transform = model_transform.times(Mat4.translation([3, 0, 10]))
            this.shapes.sphere.draw(gs, model_transform, this.materials.black)
            model_transform = model_transform.times(Mat4.translation([-6, 0, 0]))
            this.shapes.sphere.draw(gs, model_transform, this.materials.black)

            //nose
            model_transform = model_transform.times(Mat4.translation([3, -3, -1]))
            model_transform = model_transform.times(Mat4.rotation(Math.PI/2, Vec.of(1,0,0)))
            model_transform = model_transform.times(Mat4.scale([1, 6, 1]))
            this.shapes.pyramid.draw(gs, model_transform, this.materials.fire2)

            //hat
            if (hat == true){
                model_transform = Mat4.translation([x,size,z]).times(Mat4.scale([size,size,size]))
                model_transform = model_transform.times(Mat4.translation([0,4,0]))

                model_transform = model_transform.times(Mat4.scale([1.5, .1, 1.5]))
                this.shapes.box.draw(gs, model_transform, this.textures.leather)
                model_transform = model_transform.times(Mat4.scale([.6, 15, .6]))
                this.shapes.box.draw(gs, model_transform, this.textures.leather)
            }
        }

        drawMountain(){
            let gs = this.globals.graphics_state
            let model_transform = Mat4.translation([-285,30,-300])
            model_transform = model_transform.times(Mat4.rotation(Math.PI/4, Vec.of(0,0,-1)))
            model_transform = model_transform.times(Mat4.scale([200, 200, 200]))
            this.shapes.pyramid.draw(gs, model_transform, this.textures.snow2)
            model_transform = model_transform.times(Mat4.scale([1/4, 1, 1/4]))
            model_transform = model_transform.times(Mat4.translation([0, .43, 0]))
            model_transform = model_transform.times(Mat4.rotation(Math.PI/4.5, Vec.of(0,0,-1)))

            this.shapes.pyramid.draw(gs, model_transform, this.textures.snow2)
        }

        /****************************** LAVA LEVEL FUNCTIONS ******************************/
        drawShape(shape, x, y, z, size, roty, texture) {
            const trans = Mat4.identity().times(Mat4.translation([x,y,z]))
                                         .times(Mat4.scale([size, size, size]))
                                         .times(Mat4.rotation(roty, Vec.of(0,1,0)));
            shape.draw(this.globals.graphics_state, trans, texture);
        }

        drawLevelFive() {
            this.drawStage();
            if (!this.lava_stage) this.lava_init();
            let fell = 1;
            for (let i = 0; i < this.platforms.length; i++) {
                // draw platform
                this.draw_platform(this.platforms[i]);
                // check collision
                if (!this.platforms[i].outside(this.ctrans)) fell = 0;
                if (this.platforms[i].check_button(this.ctrans)) this.add_platform(this.platforms[i].next); 
            }
            if (fell) {
                this.ctrans = Mat4.inverse(Mat4.translation([0, -5, 0])); 
                this.ud = this.rd = Mat4.identity(); // undo/redo vertical rotation
            }
            if (this.test_goal(70, 285, 20)) this.lava_end();
        }

        drawStage() {
            this.drawShape(this.shapes.ground, 0, -1, 0, 1200, Math.PI/2, this.materials.lava);
            this.drawShape(this.shapes.pyramid, 300, 0, 300, 100, Math.PI/6, this.materials.mtn);
            this.drawShape(this.shapes.pyramid, 90, 0, -170, 80, -Math.PI/3, this.materials.mtn);
            this.drawShape(this.shapes.pyramid, 60, 0, -150, 30, -Math.PI/4, this.materials.mtn);
            this.drawShape(this.shapes.sphere, 70, 10, 285, 20, 0, this.plastic);
            const sky_trans = Mat4.identity().times(Mat4.translation([0,-300,0]))
                                             .times(Mat4.scale([600, 600, 600]))
                                             .times(Mat4.rotation(Math.PI/2, Vec.of(1,0,0)));
            this.shapes.sphere.draw(this.globals.graphics_state, sky_trans, this.textures.nebula);
        }

        draw_platform(p) {
            const loc = Mat4.identity().times(Mat4.translation([p.x,0,p.y]));
            const scale = loc.times(Mat4.scale([p.length, 1, p.width]));
            this.shapes.ground.draw(this.globals.graphics_state, scale, this.textures.glass);
            if (p.button.exists) {
                const l2 = loc.times(Mat4.translation([p.button.x,0,p.button.y]))
                              .times(Mat4.scale([5, 30, 5]));
                this.shapes.pyramid.draw(this.globals.graphics_state, l2, this.plastic);
            }
        }

        add_platform(next) {
            const n = this.platformlist[next];
            this.platforms.push(new Platform(n[0], n[1], n[2], n[3], new Button(n[4], n[5], n[6]), n[7]));
        }

        lava_init() {
            this.minDomain = [-600,-600];
            this.maxDomain = [600,600];
            this.lights = [new Light(Vec.of(0, 50, -200, 1), Color.of(1, .4, 1, 1), 100000)]; // reset lights
            this.reset_camera(0, -5, 0);
            this.platformlist = [[0, 0, 200, 200, true, 70, -70, 1],
                                 [0, -200, 50, 200, true, 20, -70, 2],
                                 [-75, -325, 200, 50, true, -75, -20, 3],
                                 [-225, -325, 100, 50, true, 0, 0, 4],
                                 [-155, -225, 40, 150, true, 16, -60, 5],
                                 [-250, 0, 50, 600, true, 0, 0, 6],
                                 [-75, 285, 300, 30, false, 0, 0, 7]];

            this.platforms = [new Platform(0, 0, 200, 200, new Button(true, 70, -70), 1)];  // add first platform and button
            this.lava_stage = 1;                                                            // turn off init flag
        }

        test_goal(x, z, diameter) {
            return (Math.abs(x-this.ctrans[0][3]) <= diameter/2) && (Math.abs(z-this.ctrans[2][3]) <= diameter/2);
        }

        lava_end() { // reset min/max Domains and increment current level
            this.minDomain = [-195,-395];
            this.maxDomain = [195,-5];
            this.reset_camera(0, -5, 3);
            this.current_level++;
        }
        /****************************** LAVA LEVEL FUNCTIONS ******************************/

        drawLevelThree(){
            this.drawSnow(7, 8, 6, this.textures.snow);
            this.drawGround(0, 0, -200, 400, this.textures.snow);
            this.drawBorder(0, -250, -200, 400, 500, this.textures.snow_bg)
            this.drawGround(0, 200, -200, 400, this.textures.clouds)

            this.drawGround(-50, .1, -40, 70, this.textures.ice);
            this.drawGround(70, .1, -40, 70, this.textures.ice);
            this.drawMountain();

            var j;
            for (j = 0; j < 50; j++) {
                this.drawSnowyTree(this.randomX[j], this.randomZ[j], this.randomSize[j]);
                if (j%2) {
                    this.drawSnowman(this.randomX[100-j], this.randomZ[100-j], 2, false)
                }
            }
            this.drawSnowman(100, -300, 3, true)
            let cam_x = this.ctrans[0][3]
            let cam_z = this.ctrans[2][3]
            if (cam_x > 97 && cam_x < 103 && cam_z < -297 && cam_z > -303){
                this.reset_camera(0, -5, 3);
                this.current_level = 4;
            }
        }


        drawLevelTwo() {
            this.drawGround(0, 0, -200, 400, this.sand_texture);
            this.drawGround(0, 50, -200, 400, this.sunHalo_texture)

            this.drawBorder(0, -40, -200, 400, 100, this.dune_texture)
            this.drawPyramid(0, -200)

            this.drawVulture();

            this.drawCactus(-40,-50)
            this.drawCactus(110,-80)
            this.drawCactus(-80,-150)
            this.drawCactus(20,-30) 
            this.drawCactus(-40,-300)
            this.drawCactus(150,-280)
            this.drawCactus(-160,-250)
            this.drawCactus(20,-330) 
            
            let cam_x = this.ctrans[0][3]
            let cam_z = this.ctrans[2][3]

            if (cam_x < 2 && cam_x > -2 && cam_z < -198 && cam_z > -202){
                this.reset_camera(0, -5, 3)
                this.current_level = 3;
            }
        }

        drawBruinLevel(){
            this.drawGround(0, 0, -200, 400, this.textures.bruins);
            this.drawBorder(0, 0, -200, 400, 400, this.textures.bruins)
            this.drawSnow(10, 3, 10, this.materials.fire3)
            this.drawSnow(10, 4, 10, this.materials.blue)
        }

        mouse_position(event, canvas) {
            const rect = canvas.getBoundingClientRect();
            return Vec.of(event.clientX - (rect.left + rect.right) / 2,
                          event.clientY - (rect.bottom + rect.top) / 2,
                          0);
        }

        update_mouse(event, canvas) {
            // when mouse is moved, update current rotational position and set new mouse position
            const newpos = this.mouse_position(event, canvas);
            const rot_vec = newpos.minus(this.mouse_pos);
            this.m_rh = rot_vec[0];
            this.m_rv = rot_vec[1];
            this.mouse_pos = newpos;
        }

        move() { // move camera, then update the undo/redo matrices
            const h_trans = (this.mouse_down) ? 0.01*this.m_rh : 0.03*this.roth;
            const v_trans = (this.mouse_down) ? 0.01*this.m_rv : 0.03*this.rotv;

            const a = this.ctrans.times(this.ud)
                                 .times(Mat4.translation([this.movx, 0, this.movz]))
                                 .times(Mat4.rotation(h_trans, Vec.of(0, 1, 0)))
                                 .times(this.rd)
                                 .times(Mat4.rotation(v_trans, Vec.of(1, 0, 0)));

            this.ud = this.ud.times(Mat4.rotation(-v_trans, Vec.of(1, 0, 0)));
            this.rd = this.rd.times(Mat4.rotation(v_trans, Vec.of(1, 0, 0)));
            this.m_rv = this.m_rh = 0;
            return a;
        }

        reset_camera(x, y, z) {
            this.ctrans = Mat4.inverse(Mat4.translation([x, y, z]));
            this.ud = this.rd = Mat4.identity();
        }


        display(graphics_state) {
            graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
            
            switch(this.current_level){

                case 1: this.drawLevelOne(); break;
                case 2: this.drawLevelTwo(); break;
                case 3: this.drawLevelThree(); break;
                case 4: break;
                case 5: this.drawLevelFive(); break;
                case 6: this.drawBruinLevel(); break;
                
                default: this.drawLevelOne(); break;
            }

            let cam_x = this.ctrans[0][3]
            let cam_z = this.ctrans[2][3]

            this.ctrans = this.move();
            graphics_state.camera_transform = Mat4.inverse(this.ctrans);   

            if ( cam_x < this.minDomain[0]) {
                this.ctrans[0][3] = this.ctrans[0][3]+1;
            } 
            else if (cam_x > this.maxDomain[0]) {
               this.ctrans[0][3] = this.ctrans[0][3]-1;
            }
            else if ( cam_z < this.minDomain[1]) {
                this.ctrans[2][3] = this.ctrans[2][3]+1;
            } 
            else if ( cam_z > this.maxDomain[1]) {
                this.ctrans[2][3] = this.ctrans[2][3]-1;
            }
        }

    };



class Texture_Scroll_X extends Phong_Shader {
    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // TODO:  Modify the shader below (right now it's just the same fragment shader as Phong_Shader) for requirement #6.
        return `
        uniform sampler2D texture;
        void main()
        { if( GOURAUD || COLOR_NORMALS )    // Do smooth "Phong" shading unless options like "Gouraud mode" are wanted instead.
          { gl_FragColor = VERTEX_COLOR;    // Otherwise, we already have final colors to smear (interpolate) across vertices.            
            return;
          }                                 // If we get this far, calculate Smooth "Phong" Shading as opposed to Gouraud Shading.
                                            // Phong shading is not to be confused with the Phong Reflection Model.
          // period of rotation is 10s (trial and error)
          float a_time = mod(animation_time, 10.0); // used https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/mod.xhtml since glsl doesn't use %
          vec4 tex_color = texture2D( texture, vec2(f_tex_coord[0] + 0.2*a_time, f_tex_coord[1]) );  // Sample the texture image in the correct place.
                                                                                      // Compute an initial (ambient) color:
          if( USE_TEXTURE ) gl_FragColor = vec4( ( tex_color.xyz + shapeColor.xyz ) * ambient, shapeColor.w * tex_color.w ); 
          else gl_FragColor = vec4( shapeColor.xyz * ambient, shapeColor.w );
          gl_FragColor.xyz += phong_model_lights( N );                     // Compute the final color with contributions from lights.
        }`;
    }
};

class Platform {
    constructor(x, y, l, w, button, n) {
        this.x = x;
        this.y = y;
        this.length = l;
        this.width = w;
        this.button = button;
        this.next = n;
    }

    outside(matrix) {
        /*console.log(Math.abs(this.x-matrix[0][3])>this.length/2);
        console.log(Math.abs(this.y-matrix[2][3])>this.width/2);*/
        const l = (Math.abs(this.x-matrix[0][3]) > this.length/2) || (Math.abs(this.y-matrix[2][3]) > this.width/2);
        //if (l) console.log("outside\n");
        return l;
    }

    check_button(matrix) {
        if (this.button.exists) {
            const collided = (Math.abs(this.x+this.button.x-matrix[0][3]) <= 5)
                           && (Math.abs(this.y+this.button.y-matrix[2][3]) <= 5);
            if (collided) this.button.exists = false;
            return collided;
        }
        return false;
    }
};

class Button {
    constructor(exists, x, y) {
        this.exists = exists;
        this.x = x;
        this.y = y;
    }
};