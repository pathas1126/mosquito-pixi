import styles from './mosquito.module.css';
import * as PIXI from 'pixi.js';
import { useEffect, useRef, useState } from 'react';
import * as TWEEDLE from 'tweedle.js';
import { DropShadowFilter } from '@pixi/filter-drop-shadow';

interface IProps {
  mosquitoLength: number;
  backgroundImage: string;
  pathPointLength?: number;
}

const Mosquito: React.FC<IProps> = ({ mosquitoLength, backgroundImage, pathPointLength = 10 }) => {
  const [pixi, setPixi] = useState<PIXI.Application<PIXI.ICanvas>>();
  const refWrapper = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mainElement = refWrapper.current;

    if (!mainElement) return;
    if (!pixi) {
      const app = new PIXI.Application({ resizeTo: mainElement });
      mainElement.appendChild(app.view as any);
      app.ticker.add(() => TWEEDLE.Group.shared.update());

      setPixi(app);
    }
  }, [pixi]);

  useEffect(() => {
    if (!pixi) return;

    const { width, height } = pixi.screen;
    const stageSize = { width, height };
    const backgroundSprite = Object.assign(PIXI.Sprite.from(backgroundImage), stageSize);
    pixi.stage.addChildAt(backgroundSprite, 0);

    const texture = PIXI.Texture.from('mosquito.png');

    const TIME = 10000;

    const { xPaths, yPaths } = getRandomPaths({
      maxHeight: refWrapper.current?.offsetHeight ?? 0,
      maxWidth: refWrapper.current?.offsetWidth ?? 0,
      length: mosquitoLength,
      pointLength: pathPointLength,
    });

    const mosquitos = getMosquitos({ texture, length: mosquitoLength, pixi });

    animate({ mosquitos, pixi, time: TIME, xPaths, yPaths });

    // showAuxGraphics({ xPaths, yPaths, pixi });
  }, [pixi, mosquitoLength, pathPointLength, backgroundImage]);

  const getRandomPaths = ({
    maxHeight,
    maxWidth,
    length = 10,
    pointLength = 10,
  }: {
    maxHeight: number;
    maxWidth: number;
    length?: number;
    pointLength?: number;
  }) => {
    const empty = new Array(length).fill(0);

    const xPathsRandom = empty.map(() => new Array(pointLength).fill(0).map(() => Math.floor(Math.random() * maxWidth)));
    const yPathsRandom = empty.map(() => new Array(pointLength).fill(0).map(() => Math.floor(Math.random() * maxHeight)));

    return { xPaths: xPathsRandom, yPaths: yPathsRandom };
  };

  const getMosquitos = ({ texture, length, pixi }: { texture: PIXI.Texture; length: number; pixi: PIXI.Application }) => {
    const moiquitos = new Array(length).fill(0).map(() => {
      const mosquito = new PIXI.Sprite(texture);
      mosquito.interactive = true;
      mosquito.cursor = 'pointer';
      mosquito.zIndex = 1;
      mosquito.on('pointerdown', (event) => {
        const textureBlood = PIXI.Texture.from('blood.png');
        const spriteBlood = new PIXI.Sprite(textureBlood);
        spriteBlood.width = 45;
        spriteBlood.height = 45;
        spriteBlood.zIndex = 0;
        spriteBlood.position.x = event.screen.x;
        spriteBlood.position.y = event.screen.y;
        pixi.stage.addChild(spriteBlood);

        mosquito.visible = false;
      });
      mosquito.width = 30;
      mosquito.height = 30;
      mosquito.filters = [new DropShadowFilter()];
      return mosquito;
    });

    return moiquitos;
  };

  const animate = ({
    xPaths,
    yPaths,
    mosquitos,
    pixi,
    time,
  }: {
    xPaths: number[][];
    yPaths: number[][];
    mosquitos: PIXI.Sprite[];
    pixi: PIXI.Application<PIXI.ICanvas>;
    time: number;
  }) => {
    mosquitos.forEach((mosquito, index) => {
      pixi.stage.addChild(mosquito);
      new TWEEDLE.Tween(mosquito)
        .from({ x: xPaths[index][0], y: yPaths[index][0] })
        .to({ x: xPaths[index], y: yPaths[index] }, time)
        .repeat(Infinity)
        .interpolation(TWEEDLE.Interpolation.Geom.CatmullRom)
        .start();
    });
  };

  const showAuxGraphics = ({ xPaths, yPaths, pixi }: { xPaths: number[][]; yPaths: number[][]; pixi: PIXI.Application<PIXI.ICanvas> }) => {
    const auxGraphics = new PIXI.Graphics();
    auxGraphics.lineStyle(2, 0xffffff, 1);
    for (let i = 0; i < xPaths.length; i++) {
      for (let j = 0; j < xPaths[i].length; j++) {
        auxGraphics.lineTo(xPaths[i][j], yPaths[i][j]);
        auxGraphics.drawCircle(xPaths[i][j], yPaths[i][j], 5);
      }
    }
    pixi.stage.addChild(auxGraphics);
  };

  return <div className={styles.main} ref={refWrapper}></div>;
};

export default Mosquito;
