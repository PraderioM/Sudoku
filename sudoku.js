/* function buildtable will introduce an empty sudoku inside the Table form it will also create a button that
* will permit to fill the sudoku or will detect unexpected imputs using the checksudoku() function and the object
* SudokuTable that will contain an array with the numbers introduced in the sudoku*/
function buildtable(){
	var text, i, j, n;
	text="<center>\n";
	text=text+'<p> Introdueix les dades del teu SuDoKu </p>\n';
	for (j=0; j<9; j++){
		for (i=0; i<9; i++){
			n=9*j+i;
			text=text+'<input type="text" name="position'+n+'" id="position'+n+'" style="width:19px" onclick="showoptions('+n+')" value="">\n';
			if (i%3==2 && i!=8){
				text=text+'&nbsp\n';
			}
		}
		text=text+'<br>\n'
		if (j%3==2){
			text=text+'<br>\n';
		}
	}
	text+='<p><table><tr><td align="center"><input type="button" name="SolveSudoku" id="SolveSudoku" ';
	text+='value="Omplir SuDoKu" onclick="checksudoku()"></td><td align="center"></td><td align="center"><input ';
	text+='type="button" name="TryAgain" id="TryAgain" value="Torna a Intentar" onclick="checksudoku()" ';
	text+='style="display:none"></td></tr></table></p>\n';
	text+='</center>\n';
	document.getElementById("Table").innerHTML=text;
	SudokuTable=new Object();
	SudokuTable.numbers=[];
	SudokuTable.copy=[];
	SudokuTable.aux=[];
	for (i=0; i<81; i++){
		for(j=0; j<9; j++){
			SudokuTable.aux[9*i+j]=j+1;
		}
	}
	Boxes= new Object();
	for (i=0; i<81; i++){
		Boxes["box"+i]=new makebox(i);
	}
}

function makebox(position){
	var i, j, Bb;
	i=Math.floor(position/9);
	j=position-9*i;
	this.line=i;
	this.column=j;
	i=Math.floor(i/3);
	j=Math.floor(j/3);
	this.BigBox=3*i+1*j;
	this.BigBoxLine=i;
	this.BigBoxColumn=j;
	this.possible=[1,2,3,4,5,6,7,8,9];
}

/* function checksudoku will check if the inputs in the sudoku table are correct, send an error message if they are not
*  and fill the sudoku using fillsudoku() function if they are*/
function checksudoku(){
	var i, errors=0;
	for (i=0; i<81; i++){
		if (document.Table["position"+i].value==""){
			SudokuTable.numbers[i]=0;
			SudokuTable.copy[i]=0;
		}
		else if(document.Table["position"+i].value>9 || document.Table["position"+i].value<1 || isNaN(document.Table["position"+i].value)){
			errors++;
			document.Table["position"+i].value="ERROR";
		}
		else{
			document.Table["position"+i].value=Math.floor(Number(document.Table["position"+i].value));
			SudokuTable.numbers[i]=Number(document.Table["position"+i].value);
			SudokuTable.copy[i]=SudokuTable.numbers[i];
		}
	}
	if (errors>0){
		alert("Valors introduits no valids.\nCorretgeixi els errors");
	}
	else{
		do {
			i=fillsudoku();
		}
		while (i==0);
		i=escomplet();
		if (esposible()==1){
			alert("No existeix cap combinaci\363 de nombres que pugui omplir aquest SuDoKu.");
			imprimirsudoku();
			document.Table.SolveSudoku.value="Netejar SuDoKu";
			document.Table.SolveSudoku.setAttribute("onclick", "buildtable()");
			document.Table.TryAgain.style.display='block';
		}
		else if (i==0){
			imprimirsudoku();
			document.Table.SolveSudoku.value="Netejar SuDoKu";
			document.Table.SolveSudoku.setAttribute("onclick", "buildtable()");
			document.Table.TryAgain.style.display='block';
		}
		else{
			PossibleFills= new Object();
			PossibleFills.alreadyfilled='no';
			i=0;
			while (i>-1){
				i=trytillyoudie(i);
			}
		}
	}
}

function trytillyoudie(time){
	var i, list, j;
	try{
		list=PossibleFills["option"+time].tried;
		for (i=0; i<81; i++){
			SudokuTable.numbers[i]=PossibleFills["option"+time].sudoku[i];
			SudokuTable.copy[i]=SudokuTable.numbers[i];
			for(j=0; j<9; j++){
				SudokuTable.aux[9*i+j]=j+1;
			}
		}
	}
	catch (err){
		PossibleFills["option"+time]=new createoptions(time);
		list="no";
	}
	if (PossibleFills["option"+time].optionlist.length==0){
		i=time-1;
		if (i<0){
			alert("No existeix cap combinaci\363 de nombres que pugui omplir aquest SuDoKu.");
			SudokuTable.numbers=PossibleFills["option0"].sudoku;
			imprimirsudoku();
			document.Table.SolveSudoku.value="Netejar SuDoKu";
			document.Table.SolveSudoku.setAttribute("onclick", "buildtable()");
			document.Table.TryAgain.style.display='block';
			return -1;
		}
		else{
			delete PossibleFills["option"+time];
			return i;
		}
	}
	else{
		j=PossibleFills["option"+time].optionlist.pop();
		i=PossibleFills["option"+time].position;
		SudokuTable.numbers[i]=j;
		SudokuTable.copy[i]=j;
		do {
			i=fillsudoku();
		}
		while (i==0);
		i=escomplet();
		if (esposible()==1){
			return time;
		}
		else if (i==0){
			if (PossibleFills.alreadyfilled=='no'){
				PossibleFills.alreadyfilled='yes';
				imprimirsudoku();
				document.Table.SolveSudoku.value="Netejar SuDoKu";
				document.Table.SolveSudoku.setAttribute("onclick", "buildtable()");
				document.Table.TryAgain.style.display='block';
				if (PossibleFills['option0'].optionlist.length==0){
					return -1;
				}
				else{
					for (i=time; i>0; i--){
						delete PossibleFills["option"+time];
						return 0;
					}
				}
			}
			else{
				alert('Aquest SuDoKu no te soluci\363 \372nica.');
				return -1;	
			}
		}
		else{
			i=Number(time)+Number(1);
			return i;
		}
	}
}

function createoptions(time){
	var i, dimension;
	out:
	for (dimension=2; dimension<10; dimension++){
		for (i=0; i<81; i++){
			list=options(i);
			if (list.length==dimension){
				break out;
			}
		}
	}
	this.optionlist=options(i);
	this.name="option"+time;
	this.id="option"+time;
	this.tried="yes";
	this.position=i;
	this.sudoku=[];
	for (i=0; i<81; i++){
		this.sudoku[i]=SudokuTable.numbers[i];
	}
}

/* function fillsudoku will solve the sudoku using methods that I'm to lazy to explain*/
function fillsudoku(){
	var canvi;
	esborraopcions();
	canvi=laquequeda();
	canvi+=nopotsenllocmes();
	if(canvi==0){
		return 1;
	}
	else{
		return 0;
	}
}

function escomplet(){
	var i;
	for (i=0; i<81; i++){
		if (SudokuTable.numbers[i]==0){
			return 1;
		}
	}
	return 0;
}

function esborraopcions(){
	var i, j, k, fila, columna, filabloc, columnabloc;
	for (i=0; i<81; i++){
		if(SudokuTable.copy[i]!=0){
			fila=Math.floor(i/9);
			filabloc=Math.floor(fila/3);
			columna=i-9*fila;
			columnabloc=Math.floor(columna/3);
			for (j=0; j<9; j++){
				SudokuTable.aux[9*i+j]=0;
				SudokuTable.aux[9*(9*fila+1*j)+1*SudokuTable.copy[i]-1]=0;
				SudokuTable.aux[9*(9*j+1*columna)+1*SudokuTable.copy[i]-1]=0;
			}
			for (j=0; j<3; j++){
				for(k=0; k<3; k++){
					SudokuTable.aux[9*(9*(3*filabloc+1*j)+3*columnabloc+1*k)+1*SudokuTable.copy[i]-1]=0;
				}
			}
			SudokuTable.copy[i]=0;
		}
	}
}

function laquequeda(){
	var i, j, m, sum, canvi=0;
	for(i=0; i<81; i++){
		m=0;
		sum=0;
		for(j=0; j<9; j++){
			if(SudokuTable.aux[9*i+1*j]!=0){
				sum+=SudokuTable.aux[9*i+1*j];
				m++;
			}
		}
		if(m==1){
			SudokuTable.copy[i]=sum;
			SudokuTable.numbers[i]=SudokuTable.copy[i];
			canvi++;
		}
	}
	return canvi;
}

function nopotsenllocmes(){
	var canvi;
	canvi=Number(nopotsenllocmesfiles());
	canvi+=1*nopotsenllocmescolumnes();
	canvi+=1*nopotsenllocmesblocs();
	return canvi;
}

function nopotsenllocmesfiles(){
	var fila, columna, numero, m, canvi=0, blocs=[], position, eliminats, i, j,blocline, bloccolumn;
	for (fila=0; fila<9; fila++){
		for (numero=0; numero<9; numero++){
			m=0;
			blocs=["cokie","cokie","cokie"];
			for (columna=0; columna<9; columna++){
				if(SudokuTable.aux[9*(9*fila+1*columna)+1*numero]!=0){
					position=9*fila+1*columna;
					blocs[m]=Number(Boxes["box"+position].BigBox);
					m++;
				}
			}
			if (m==1){
				for(columna=0; columna<9; columna++){
					if(SudokuTable.aux[9*(9*fila+1*columna)+1*numero]!=0){
						SudokuTable.copy[9*fila+1*columna]=1*numero+1;
						SudokuTable.numbers[9*fila+1*columna]=SudokuTable.copy[9*fila+1*columna];
						canvi++;
					}
				}
			}
			else if (m==2 || m==3){
				i=samevalue(blocs, m);
				if (i==0){
					blocline=Boxes["box"+position].BigBoxLine;
					bloccolumn=Boxes["box"+position].BigBoxColumn;
					eliminats=0;
					for (i=0; i<3; i++){
						if ((3*blocline+1*i)!=fila){
							for (j=0; j<3; j++){
								if (SudokuTable.aux[9*(9*(3*blocline+1*i)+3*bloccolumn+1*j)+1*numero]!=0){
									SudokuTable.aux[9*(9*(3*blocline+1*i)+3*bloccolumn+1*j)+1*numero]=0;
									eliminats++;
								}
							}
						}
					}
					if (eliminats>0){
						canvi++;
					}
				}
			}
		}
	}
	return canvi;
}

function nopotsenllocmescolumnes(){
	var fila, columna, numero, m, canvi=0, blocs=[], position, eliminats, i, j, blocline, bloccolumn;
	for (columna=0; columna<9; columna++){
		for (numero=0; numero<9; numero++){
			m=0;
			for (fila=0; fila<9; fila++){
				if(SudokuTable.aux[9*(9*fila+1*columna)+1*numero]!=0){
					position=9*fila+1*columna;
					blocs[m]=Number(Boxes["box"+position].BigBox);
					m++;
				}
			}
			if (m==1){
				for(fila=0; fila<9; fila++){
					if(SudokuTable.aux[9*(9*fila+1*columna)+1*numero]!=0){
						SudokuTable.copy[9*fila+1*columna]=1*numero+1;
						SudokuTable.numbers[9*fila+1*columna]=SudokuTable.copy[9*fila+1*columna];
						canvi++;
					}
				}
			}
			else if (m==2 || m==3){
				i=samevalue(blocs, m);
				if (i==0){
					blocline=Boxes["box"+position].BigBoxLine;
					bloccolumn=Boxes["box"+position].BigBoxColumn;
					eliminats=0;
					for (j=0; j<3; j++){
						if ((3*bloccolumn+1*j)!=columna){
							for (i=0; i<3; i++){
								if (SudokuTable.aux[9*(9*(3*blocline+1*i)+3*bloccolumn+1*j)+1*numero]!=0){
									SudokuTable.aux[9*(9*(3*blocline+1*i)+3*bloccolumn+1*j)+1*numero]=0;
									eliminats++;
								}
							}
						}
					}
					if (eliminats>0){
						canvi++;
					}
				}
			}
		}
	}
	return canvi;
}

function nopotsenllocmesblocs(){
	var fila, columna, filabloc, columnabloc, numero, m, i, files, columnes, eliminats, canvi=0;
	for (filabloc=0; filabloc<3; filabloc++){
		for (columnabloc=0; columnabloc<3; columnabloc++){
			for (numero=0; numero<9; numero++){
				m=0;
				files=["cokie","cokie","cokie"];
				columnes=["cokie","cokie","cokie"];
				for (fila=0; fila<3; fila++){
					for (columna=0; columna<3; columna++){
						if (SudokuTable.aux[9*(9*(3*filabloc+1*fila)+3*columnabloc+1*columna)+1*numero]!=0){
							files[m]=Number(3*filabloc+1*fila);
							columnes[m]=Number(3*columnabloc+1*columna);
							m++;
						}
					}
				}
				if (m==1){
					for (fila=0; fila<3; fila++){
						for (columna=0; columna<3; columna++){
							if (SudokuTable.aux[9*(9*(3*filabloc+1*fila)+3*columnabloc+1*columna)+1*numero]!=0){
								SudokuTable.copy[9*(3*filabloc+1*fila)+3*columnabloc+1*columna]=Number(1*numero+1*1);
								SudokuTable.numbers[9*(3*filabloc+1*fila)+3*columnabloc+1*columna]=SudokuTable.copy[9*(3*filabloc+1*fila)+3*columnabloc+1*columna];
								canvi++;
							}
						}
					}
				}
				else if (m==2 || m==3){
					i=samevalue(files, m);
					if (i==0){
						eliminats=0;
						for (columna=0; columna<9; columna++){
							if (SudokuTable.aux[9*(9*files[0]+1*columna)+1*numero]!=0){
								SudokuTable.aux[9*(9*files[0]+1*columna)+1*numero]=0;
								eliminats++;
							}
						}
						for (columna=0; columna<m; columna++){
							SudokuTable.aux[9*(9*files[0]+1*columnes[columna])+1*numero]=Number(numero)+Number(1);
						}
						eliminats+=-m;
						if (eliminats>0){
							canvi++;
						}
					}
					i=samevalue(columnes, m);
					if (i==0){
						eliminats=0;
						for (fila=0; fila<9; fila++){
							if (SudokuTable.aux[9*(9*fila+1*columnes[0])+1*numero]!=0){
								SudokuTable.aux[9*(9*fila+1*columnes[0])+1*numero]=0;
								eliminats++;
							}
						}
						for (fila=0; fila<m; fila++){
							SudokuTable.aux[9*(9*files[fila]+1*columnes[0])+1*numero]=Number(1*numero+1*1);
						}
						eliminats+=-m;
						if (eliminats>0){
							canvi++;
						}
					}
				}
			}
		}
	}
	return canvi;
}

function samevalue(list, length){
	var i;
	for (i=1; i<length; i++){
		if (list[0]!=list[i]){
			return 1;
		}
	}
	return 0;
}

function esposible(){
	var i;
	i=esposible1();
	if (i!=0){
		return 1;
	}
	i=esposible2();
	if (i!=0){
		return 1;
	}
	return 0;
}

function esposible1(){
	var i, j, sum;
	for (i=0; i<81; i++){
		sum=0;
		if (SudokuTable.numbers[i]==0){
			for (j=0; j<9; j++){
				sum+=1*SudokuTable.aux[9*i+1*j];
			}
			if (sum==0){
				return 1;
			}
		}
	}
	return 0;
}

function esposible2(){
	var i;
	for (i=0; i<81; i++){
		if (SudokuTable.numbers[i]!=0){
			SudokuTable.aux[9*i+1*SudokuTable.numbers[i]-1]=SudokuTable.numbers[i];
		}
	}
	i=esposible2files();
	if (i!=0){
		return 1; 
	}
	i=esposible2columnes();
	if (i!=0){
		return 1; 
	}
	i=esposible2blocs();
	if (i!=0){
		return 1;
	}
	return 0;  
}

function esposible2files(){
	var fila, columna, numero, sum;
	for (fila=0; fila<9; fila++){
		for (numero=0; numero<9; numero++){
			sum=0;
			for (columna=0; columna<9; columna++){
				sum+=SudokuTable.aux[9*(9*fila+columna)+numero];
			}
			if (sum==0){
				return 1;
			}
		}
	}
	return 0;
}

function esposible2columnes(){
	var fila, columna, numero, sum;
	for (columna=0; columna<9; columna++){
		for (numero=0; numero<9; numero++){
			sum=0;
			for (fila=0; fila<9; fila++){
				sum+=SudokuTable.aux[9*(9*fila+1*columna)+1*numero];
			}
			if (sum==0){
				return 1;
			}
		}
	}
	return 0;
}

function esposible2blocs(){
	var filabloc, columnabloc, fila, columna, numero, sum;
	for (filabloc=0; filabloc<3; filabloc++){
		for (columnabloc=0; columnabloc<3; columnabloc++){
			for (numero=0; numero<9; numero++){
				sum=0;
				for (fila=0; fila<3; fila++){
					for (columna=0; columna<3; columna++){
						sum+=SudokuTable.aux[9*(9*(3*filabloc+fila)+3*columnabloc+1*columna)+1*numero];
					}
				}
				if (sum==0){
					return 1;
				}
			}
		}
	}
	return 0;
}

function imprimirsudoku(){
	var n, i;
	for (i=0; i<81; i++){
		n=SudokuTable.numbers[i];
		if (n!=0){
			document.Table["position"+i].value=n;
		}
		else{
			document.Table["position"+i].value="";
		}
	}
}

function test(){
	document.Table["position0"].value=1;
	document.Table["position5"].value=7;
	document.Table["position7"].value=9;
	document.Table["position17"].value=8;
	document.Table["position13"].value=2;
	document.Table["position10"].value=3;
	document.Table["position20"].value=9;
	document.Table["position30"].value=3;
	document.Table["position40"].value=8;
	document.Table["position50"].value=4;
	document.Table["position21"].value=6;
	document.Table["position29"].value=5;
	document.Table["position37"].value=1;
	document.Table["position45"].value=6;
	document.Table["position54"].value=3;
	document.Table["position64"].value=4;
	document.Table["position74"].value=7;
	document.Table["position33"].value=9;
	document.Table["position44"].value=2;
	document.Table["position71"].value=7;
	document.Table["position78"].value=3;
	document.Table["position61"].value=1;
	document.Table["position24"].value=5;
}

function showoptions(position){
	var i, list=[], fila, columna;
	list=options(position);
	columna=position%9;
	columna++;
	fila=Math.floor(position/9);
	fila++;
	console.log('['+list+'] '+fila+' '+columna);
}

function options (position){
	var i, list=[];
	for (i=0; i<9; i++){
		if (SudokuTable.aux[9*position+i]!=0){
			list.push(Number(i)+Number(1));
		}
	}
	return list;
}