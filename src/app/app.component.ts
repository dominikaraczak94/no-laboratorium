import { Component, ElementRef, ViewChild } from '@angular/core';
import { GraphMatrixComponent } from './graph-matrix/graph-matrix.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'no-lab';
    protected canvasId = 'canvas123';
    @ViewChild('canvasElem', { read: ElementRef }) canvasRef: ElementRef;
    private canvasElem: HTMLCanvasElement;
    private canvasContext: CanvasRenderingContext2D;

    private graphMatrix: number[][];
    private graphList: number[][];
    private paths = new Array<number[]>();
    private d_vector: number[];
    protected alpha = [50, 35, 25, 30, 40, 35, 20, 30, 60];
    protected beta = [5, 2, 8, 10, 4, 3, 9, 12, 5];
    protected S = [1000, 400, 1500, 2500, 900, 300, 1300, 2400, 800];
    protected Rmin = 0.99;
    protected Kmax = 5000000;
    private R_initial = [1, 1, 1, 1, 1, 1, 1, 1, 1];
    private K_vector: number[];
    private K_calculated: number;
    private R_calculated: number;


    constructor(private graphMatrixComponent: GraphMatrixComponent) { }
    // tslint:disable-next-line:use-life-cycle-interface
    ngOnInit(): void {
        this.canvasElem = this.canvasRef.nativeElement;
        this.canvasElem.width = this.canvasRef.nativeElement.parentNode.clientWidth;
        this.canvasElem.height = this.canvasRef.nativeElement.parentNode.clientHeight;
        this.canvasContext = this.canvasElem.getContext('2d');

    }
    // tslint:disable-next-line:use-life-cycle-interface
    ngAfterViewInit(): void {
        this.run();
    }

    run() {
        this.graphMatrix = this.graphMatrixComponent.createGraphMatrix();
        this.createAdjacencyList();
        this.findPaths();
        this.calculatePathProbabilities();
        this.calculateTotalR();
        this.calculateTotalCost();
        this.runOptimization();
    }

    createAdjacencyList() {
        const numberOfNodes = this.graphMatrixComponent.nodes;
        this.graphList = new Array(numberOfNodes);
        for (let i = 0; i < numberOfNodes; i++) {
            this.graphList[i] = new Array();
        }
        for (let i = 0; i < numberOfNodes; i++) {
            for (let j = 0; j < numberOfNodes; j++) {
                if (this.graphMatrix[i][j] > 0) {
                    this.graphList[i].push(j);
                }
            }
            console.log('elements of node: ' + i + ' : ' + this.graphList[i]);
        }
    }

    findPaths() {
        const nodes = Object.keys(this.graphList);
        const visited = new Array<boolean>();
        const pathList = new Array();
        pathList.push(+nodes[0]);
        this.findPathsUtil(+nodes[0], +nodes[nodes.length - 1], visited, pathList);
    }

    findPathsUtil(current: number, last: number, visited: boolean[], pathList: any[]) {
        visited[current] = true;
        if (current === last) {
            const tmp = new Array();
            for (let i = 0; i < pathList.length; i++) {
                tmp[i] = pathList[i];
            }
            this.paths.push(tmp);
            visited[current] = false;
            return;
        }
        for (let i = 0; i < this.graphList[current].length; i++) {
            if (!visited[this.graphList[current][i]]) {
                pathList.push(this.graphList[current][i]);
                this.findPathsUtil(this.graphList[current][i], last, visited, pathList);
                pathList.splice(pathList.indexOf(this.graphList[current][i]), 1);
            }
        }
        visited[current] = false;
    }

    calculatePathProbabilities() {
        this.d_vector = new Array(this.paths.length).fill(1);
        for (let i = 0; i < this.paths.length; i++) {
            for (let j = 0; j < this.paths[i].length - 1; j++) {
                const nodeFrom = this.paths[i][j];
                const nodeTo = this.paths[i][j + 1];
                const value = this.graphMatrix[nodeFrom][nodeTo];
                this.d_vector[i] *= value;
            }
        }
    }

    calculateNodeCosts() {
        this.K_vector = new Array();
        for (let i = 0; i < this.graphMatrixComponent.nodes; i++) {
            this.K_vector[i] = this.S[i] + (this.alpha[i] * Math.pow(Math.E, this.beta[i] * this.R_initial[i]));
        }
    }

    calculateTotalCost() {
        this.calculateNodeCosts();
        this.K_calculated = 0;
        for (let i = 0; i < this.K_vector.length; i++) {
            this.K_calculated += this.K_vector[i];
        }
    }

    calculateTotalR() {
        const RForEachPath = new Array(this.paths.length).fill(1);
        this.R_calculated = 0;
        for (let i = 0; i < this.paths.length; i++) {
            for (let j = 0; j < this.paths[i].length; j++) {
                const nodeNumber = this.paths[i][j];
                RForEachPath[i] *= this.R_initial[nodeNumber];
            }
            this.R_calculated += (this.d_vector[i] * RForEachPath[i]);
        }
    }

    runOptimization() {

        let proceed = true;
        let cursor = 0;
        while (proceed) {
            if (this.K_calculated <= 5000000 && this.R_calculated >= 0.99) {
                proceed = false;
            } else if (this.R_calculated < 0.99) {
                cursor++;
                this.R_initial = [1, 1, 1, 1, 1, 1, 1, 1, 1];
                this.calculateTotalR();
                this.calculateTotalCost();
            } else {
                this.R_initial[cursor] -= 0.001;
                this.calculateTotalR();
                this.calculateTotalCost();
                console.log('R: ' + this.R_calculated);
                console.log('K: ' + this.K_calculated);
            }
            this.draw(this.canvasContext);
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = 'white';

        ctx.fillRect(0, 0, 1000, 1000);

        ctx.font = '12px Verdana';
        ctx.fillText('Kmax = ' + this.Kmax, 10, 15);
        ctx.fillText('Rmin = ' + this.Rmin, 10, 30);

        ctx.fillStyle = 'blue';
        ctx.fillText('Ścieżki w grafie:', 10, 60);
        ctx.fillStyle = 'black';

        let rowPlacement = 10;
        let columnPlacement = 75;
        let maxRowPlacement = rowPlacement;
        for (let i = 0; i < this.paths.length; i++) {
            ctx.fillText((i + 1) + '. ', rowPlacement, columnPlacement);
            for (let j = 0; j < this.paths[i].length; j++) {
                rowPlacement += 35;
                if (j === this.paths[i].length - 1) {
                    ctx.fillText((this.paths[i][j] + 1).toString(), rowPlacement, columnPlacement);
                } else {
                    ctx.fillText((this.paths[i][j] + 1) + ' -> ', rowPlacement, columnPlacement);
                }
            }
            rowPlacement += 50;
            if (rowPlacement > maxRowPlacement) {
                maxRowPlacement = rowPlacement;
            }
            ctx.fillStyle = 'green';
            ctx.fillText('d' + (i + 1) + ': ' + this.d_vector[i].toFixed(4), maxRowPlacement, columnPlacement);
            ctx.fillStyle = 'black';
            rowPlacement = 10;
            columnPlacement += 15;
        }
        columnPlacement += 15;
        for (let i = 0; i < this.graphMatrixComponent.nodes; i++) {

            // tslint:disable-next-line:max-line-length
            ctx.fillText(i + '.  Ki: ' + this.K_vector[i].toFixed(2) + '  Ri: ' + this.R_initial[i].toFixed(4), rowPlacement, columnPlacement);
            columnPlacement += 15;
        }
        columnPlacement += 15;

        ctx.fillStyle = 'red';
        ctx.fillText('K całkowite: ' + this.K_calculated.toFixed(2), rowPlacement, columnPlacement);
        columnPlacement += 15;
        ctx.fillText('R całkowite: ' + this.R_calculated.toFixed(4), rowPlacement, columnPlacement);
    }
}

