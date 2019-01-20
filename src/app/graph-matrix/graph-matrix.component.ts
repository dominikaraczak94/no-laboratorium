import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
    selector: 'app-graph-matrix',
    templateUrl: './graph-matrix.component.html',
    styleUrls: ['./graph-matrix.component.css']
})
export class GraphMatrixComponent implements OnInit {

    constructor() { }

    protected canvasId = 'canvasGraphMatrix';
    @ViewChild('canvasElem', { read: ElementRef }) canvasRef: ElementRef;
    private canvasElem: HTMLCanvasElement;
    private canvasContext: CanvasRenderingContext2D;
    public nodes = 9;
    ngOnInit() {
        this.canvasElem = this.canvasRef.nativeElement;
        this.canvasElem.width = 360;
        this.canvasElem.height = 360;

        this.canvasContext = this.canvasElem.getContext('2d');
        const matrix = this.createGraphMatrix();
        this.drawMatrix(matrix);
    }

    public createGraphMatrix(): number[][] {
        const graphMatrix = new Array(this.nodes);
        for (let i = 0; i < this.nodes; i++) {
            graphMatrix[i] = new Array(this.nodes).fill(0);
        }

        const p01 = 0.4;
        const p02 = 0.6;
        const p13 = 0.7;
        const p16 = 0.3;
        const p23 = 0.3;
        const p24 = 0.7;
        const p34 = 0.3;
        const p35 = 0.2;
        const p36 = 0.5;
        const p47 = 1;
        const p56 = 0.4;
        const p57 = 0.6;
        const p68 = 1;
        const p76 = 0.2;
        const p78 = 0.8;
        graphMatrix[0][1] = p01;
        graphMatrix[0][2] = p02;
        graphMatrix[1][3] = p13;
        graphMatrix[1][6] = p16;
        graphMatrix[2][3] = p23;
        graphMatrix[2][4] = p24;
        graphMatrix[3][4] = p34;
        graphMatrix[3][5] = p35;
        graphMatrix[3][6] = p36;
        graphMatrix[4][7] = p47;
        graphMatrix[5][6] = p56;
        graphMatrix[5][7] = p57;
        graphMatrix[6][8] = p68;
        graphMatrix[7][6] = p76;
        graphMatrix[7][8] = p78;
        return graphMatrix;

    }


    drawMatrix(matrix: number[][]) {
        let x = 0;
        let y = 0;
        const height = 360;
        const width = 360;
        const gridSize = height / this.nodes;
        this.canvasContext.lineWidth = 1;
        this.canvasContext.beginPath();

        while (y < height) {
            y = y + gridSize;
            this.canvasContext.moveTo(x, y);
            this.canvasContext.lineTo(width, y);
        }
        y = 0;
        while (x < width) {
            x = x + gridSize;
            this.canvasContext.moveTo(x, y);
            this.canvasContext.lineTo(x, height);
        }
        this.canvasContext.font = '12px Verdana';
        for (let i = 0; i < this.nodes; i++) {
            for (let j = 0; j < this.nodes; j++) {
                this.canvasContext.fillText(matrix[j][i].toString(), i * gridSize + 12, j * gridSize + 22);
            }
        }
        this.canvasContext.stroke();
    }

}
