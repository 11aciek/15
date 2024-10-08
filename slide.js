/*jslint node: true*/
/*global $, alert*/
'use strict';

function Grid(width, height) {
    this.space  = [];
    this.width  = width;
    this.height = height;
    // lista połączeń między komórkami
    this.nodes  = (function () {
        var result = [],
            len = width * height,
            el, // komórka
            node, // węzeł
            min, // minimalna wartość w poj. wierszu
            max; // max. wartość w każdym wierszu
        
        for (el = 0; el < len; el += 1) {
            min = Math.floor(el / width) * width; // początek rzędu
            max = min + width; //koniec rzędu
            node = [];
            /* najpierw sprawdzamy czy komórka o 1 mniejsza 
                i o 1 większa jest w tym samym rzędzie */
            if ((el - 1) >= min && (el - 1) < max) {
                node.push(el - 1);
            }
            if ((el + 1) >= min && (el + 1) < max) {
                node.push(el + 1);
            }
            //teraz czy komórka o rząd niżej i wyżej nie wyjdzie poza zakres
            if ((el - width) >= 0) {
                node.push(el - width);
            }
            if ((el + width) < len) {
                node.push(el + width);
            }
            
            result.push(node);
        }
        return result;
    }());
    // wypełniamy siatkę (od 1 do len - 2); ostatni element 99
    // przy sortowaniu ma wyjść na końcu
    var i,
        origin; //tu będzie pierwowzór siatki do porównania
    
    for (i = 0; i < width * height - 1; i += 1) {
        this.space[i] = i + 1;
    }
    this.space.push(99);
    origin = this.space.slice(); // kopia space
    
    // sprawdzamy czy obecna siatka jest równa początkowej
    this.compare = function () {
        if (this.space.length !== origin.length) {
            return false;
        }
        for (i = 0; i < this.space.length; i += 1) {
            if (this.space[i] !== origin[i]) {
                return false;
            }
        }
        return true;
    };
}
// pretty printing
Grid.prototype.toString = function () {
    var printOut = "",
        len = this.width * this.height,
        i;
    
    for (i = 0; i < len; i += 1) {
        if (i % this.width === 0) {
            printOut += "\n";
        }
        printOut += this.space[i] + " \t";
    }
    
    return printOut;
};
// tworzymy tabelkę z siatki
Grid.prototype.toTable = function () {
    var table = '<table>',
        w = this.width,
        h = this.height,
        i,
        j,
        n;
    
    for (i = 0; i < h; i += 1) {
        table += '<tr>';
        for (j = 0; j < w; j += 1) {
            n = j + i * w;
            if (this.space[n] === 99) {
                table += '<td id="null">' + '</td>';
            } else if (this.space[n] < 10) {
                // jak tego zabrakło to komórki były za wąskie (w Chrome)
                table += '<td id="' + n + '">&nbsp;&nbsp;' + this.space[n] + '</td>';
            } else {
                table += '<td id="' + n + '">' + this.space[n] + '</td>';
            }
        }
        table += "</tr>";
    }
    return table + '</table>';
};
// Sprawdzamy czy dana komorka sąsiaduje z komórką 99 (pustą)
Grid.prototype.checkNodes = function (cell) {
    
    var self = this,
        target = this.nodes[cell].filter(function (n) {
            if (self.space[n] === 99) {
                return true;
            }
        });
    
    if (target.length) {
        return target;
    } else {
        return false;
    }
};
// Przesuwamy komórkę na puste miejsce
Grid.prototype.move = function (cell) {
    var target = this.checkNodes(cell),
        from = this.space[cell],
        there = this.space[target],
        temp;
    
    if (target) {
        temp = from;
        this.space[cell] = there;
        this.space[target] = temp;
        return true;
    }
};
// Tasujemy komórki
Grid.prototype.shuffle = function () {
    this.space.sort(function () {
        return 0.5 - Math.random();
    });
};

Grid.prototype.reset = function () {
    this.space.sort(function (a, b) {
        return a - b;
    });
};

(function () {
    var clickSound  = "./click.ogg",
        winSound    = "./win.ogg",
        $board      = $('#board'),
        $height     = $('#height'),
        $width      = $('#width'),
        $newBoard   = $('#new'),
        $shuffle    = $('#shuffle'),
        $reset      = $('#reset'),
        $cells,
        board,
        i;

    // Dźwięk klikania i inne dźwięki
    function playSound(target, sound) {
        var soundTag = '<audio src="' + sound + '" autoplay />';
        target.append(soundTag);
    }
    // Rysuje tabelkę i odpala readyCells
    // Sprawdza też, czy układanka jest ułożona (play musi być truthy)
    function drawTable(play) {
        $board.html(board.toTable());
        readyCells();
        
        if (play) {
            if (board.compare()) {
                playSound($board, winSound);
                alert("Congratulations!\nYou WIN!!!");
            }
        }
    }
    
    // Ustawia eventy na komórkach i po kliknięciu wywołuje ruch komórki
    // na puste miejsce (99 <-> cell)
    function readyCells() {
        $cells = $('table').find('td');
        $cells.each(function () {
            var cell = $(this);
            cell.on('click', function () {
                if (board.move(Number($(this).attr('id')))) {
                    playSound($(this), clickSound);
                    drawTable(true);
                }
            });
        });
    }
    // obsługa przycisku 'New board'
    $newBoard.on('click', function () {
        var h = Number($height.val()),
            w = Number($width.val());
        if (h > 4 || h < 2) {
            h = 3;
        } else if (w > 4 || w < 2) {
            w = 3;
        }
        board = new Grid(w, h);
        drawTable();
    });
    // Przycisk 'Shuffle'
    $shuffle.on('click', function () {
        board.shuffle();
        drawTable();
    });
    // Przycisk 'Reset'
    $reset.on('click', function () {
        board.reset();
        drawTable();
    });
}());
