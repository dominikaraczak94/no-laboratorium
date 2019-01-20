import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { GraphMatrixComponent } from './graph-matrix/graph-matrix.component';


@NgModule({
  declarations: [
    AppComponent,
    GraphMatrixComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [    GraphMatrixComponent
],
  bootstrap: [AppComponent]
})
export class AppModule { }
