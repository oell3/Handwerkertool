export class Calculator {

    recalculate(state) {
        state.angebot.groups.forEach(group => {
            group.rows.forEach(row => {
                let ep = row.ek + row.ek * (row.aufschlag / 100);
                ep -= ep * (row.rabatt / 100);

                row.ep = ep;
                row.gp = ep * row.menge;
            });

            group.rows.forEach(row => {
                if (row.type === "misch") {
                    let sum = 0;

                    group.rows.forEach(child => {
                        if (child.parentMischId === row.mischId) {
                            sum += child.gp;
                        }
                    });

                    row.gp = sum;
                }

                if (row.type === "gruppe") {
                    let sum = 0;

                    group.rows.forEach(child => {
                        if (child.parentGruppeId === row.gruppeId) {
                            sum += child.gp;
                        }
                    });

                    row.gp = sum;
                }
            });
        });
    }

   getKostenByType(state) {
    let material = 0;
    let lohn = 0;
    let sonstiges = 0;

    state.angebot.groups.forEach(group => {
        group.rows.forEach(row => {
            if (row.type === "misch" || row.type === "gruppe") return;

            const kosten = (row.ek || 0) * (row.menge || 0);

            if (row.type === "material") {
                material += kosten;
            }
            else if (row.type === "lohn") {
                lohn += kosten;
            }
            else if (row.type === "sonstiges") {
                sonstiges += kosten;
            }
        });
    });

    return {
        material,
        lohn,
        sonstiges,
        gesamt: material + lohn + sonstiges
        
    };
}

    getmargin(total, kosten){
        const margin = total - kosten || 0;
        return margin;
    }

    getmargininProcent(total, margin){
        return margin/total * 100 || 0;
    }
    getTotal(state) {
        let total = 0;

        state.angebot.groups.forEach(g => {
            g.rows.forEach(r => {
                if (!r.parentMischId && !r.parentGruppeId) {
                    total += r.gp;
                }
            });
        });

        return total;
    }
}
