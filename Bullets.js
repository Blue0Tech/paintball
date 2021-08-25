AFRAME.registerComponent('bullets',{
    schema: {
        bulletFired: {type:'bool',default:false}
    },
    shootBullet: function() {
        window.addEventListener('keydown',e=>{
            if(e.key=='z' && this.data.bulletFired==false) {
                this.data.bulletFired = true;
                setTimeout(function() {
                    var component = document.querySelector('#caller').getAttribute('bullets');
                    component.bulletFired = false;
                },350);
                var shootEntity = document.querySelector('#shootEntity');
                shootEntity.components.sound.playSound();
                var bullet = document.createElement('a-entity');
                bullet.setAttribute('geometry',{
                    primitive: 'sphere',
                    radius: 0.15
                });
                bullet.setAttribute('material',{
                    color: 'black'
                });
                var cam = document.querySelector('#camera');
                var pos = cam.getAttribute('position');
                bullet.setAttribute('position',pos);
                var camera = document.querySelector('#camera').object3D;
                var direction = new THREE.Vector3();
                camera.getWorldDirection(direction);
                // var cursor = document.querySelector('#cursor');
                // var cursorPos = cursor.getAttribute('position');
                // var resultPos = {
                //     x: cursorPos.x-pos.x,
                //     y: cursorPos.y-pos.y,
                //     z: cursorPos.z-pos.z
                // };
                // bullet.setAttribute('velocity',resultPos);
                bullet.setAttribute('velocity',direction.multiplyScalar(-30));
                var scene = document.querySelector('#scene');
                bullet.setAttribute('dynamic-body',{
                    mass: 0.003,
                    shape: 'sphere'
                });
                bullet.addEventListener('collide',e=>{
                    this.removeBullet(e,e.detail.target.el.getAttribute('position'));
                });
                scene.appendChild(bullet);
                // cam.appendChild(bullet);
            };
        });
    },
    init: function() {
        this.shootBullet();
    },
    tick: function() {
        var camera = document.querySelector('#camera');
        var rotation = camera.getAttribute('rotation');
        rotation.y+=180;
        rotation.x*=-1;
        var gun = document.querySelector('#gunEntity');
        gun.setAttribute('rotation',rotation);
        gun.setAttribute('position',camera.getAttribute('position'));
    },
    removeBullet: function(e,bulletPos) {
        var bulletEl = e.detail.target.el;
        var boxEl = e.detail.body.el;
        var boxPos = boxEl.getAttribute('position');
        var newBulletPos = {
            x: bulletPos.x - boxPos.x,
            y: bulletPos.y - boxPos.y,
            z: bulletPos.z - boxPos.z
        };
        var splatter = document.createElement('a-sphere');
        splatter.setAttribute('position',newBulletPos);
        splatter.setAttribute('radius',0.1);
        bulletEl.removeEventListener('collide',this.shootBullet);
        var scene = document.querySelector('#scene');
        scene.removeChild(bulletEl);
        boxEl.appendChild(splatter);
        if(boxEl.getAttribute('id').includes('box')) {
            boxEl.setAttribute('material',{
                opacity: 0.8,
                transparent: true
            });
            var impulse = new CANNON.Vec3(3,3,3);
            var worldPoint = new CANNON.Vec3().copy(boxEl.getAttribute('position'));
            boxEl.body.applyImpulse(impulse,worldPoint);
        };
    }
});