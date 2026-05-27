export function createRowModel(state, groupId) {
    return {
        id: ++state.rowCounter,
        groupId,

        type: "material",

        mischId: null,
        parentMischId: null,

        gruppeId: null,
        parentGruppeId: null,
        collapsed: false,

        bezeichnung: "",

        menge: 0,
        ek: 0,
        aufschlag: 0,
        rabatt: 0,

        ep: 0,
        gp: 0,

        remark: "",
        positionsart: "normal"
    };
}
