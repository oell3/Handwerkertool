export class DragDropManager {
    constructor(state, app, rowManager) {
        this.state = state;
        this.app = app;
        this.rowManager = rowManager;
        this.draggedRowId = null;
        this.dropTarget = null;
        this.bound = false;
        this.isHandleActive = false;
    }

    enable(container) {
        if (this.bound) return;
        this.bound = true;

        container.addEventListener("mousedown", e => {
            this.isHandleActive = !!e.target.closest(".drag-handle");
        });

        container.addEventListener("dragstart", e => {
            const tr = this.getTargetRow(e.target);

            if (!tr || !this.isHandleActive) {
                e.preventDefault();
                return;
            }

            this.draggedRowId = tr.dataset.id;
            tr.classList.add("dragging");
        });

        container.addEventListener("dragover", e => {
            if (!this.draggedRowId) return;

            const rowTarget = this.getTargetRow(e.target);
            if (rowTarget) {
                e.preventDefault();

                const rect = rowTarget.getBoundingClientRect();
                const offset = e.clientY - rect.top;
                const height = rect.height;

                let position = "middle";

                if (offset < height * 0.25) {
                    position = "top";
                } else if (offset > height * 0.75) {
                    position = "bottom";
                }

                this.dropTarget = {
                    type: "row",
                    id: rowTarget.dataset.id,
                    groupId: Number(rowTarget.dataset.groupId),
                    position
                };

                this.clearDropMarkers(container);
                rowTarget.classList.add(`drop-${position}`);
                return;
            }

            const groupHeader = e.target.closest("tr.group-header");
            if (groupHeader) {
                e.preventDefault();

                this.dropTarget = {
                    type: "group",
                    groupId: Number(groupHeader.dataset.groupId),
                    position: "bottom"
                };

                this.clearDropMarkers(container);
                groupHeader.classList.add("drop-middle");
            }
        });

        container.addEventListener("drop", e => {
            e.preventDefault();

            if (!this.dropTarget || !this.draggedRowId) return;

            if (this.dropTarget.type === "row") {
                const { id, groupId, position } = this.dropTarget;

                if (!id || !groupId || id === this.draggedRowId) {
                    this.clearVisualState(container);
                    return;
                }

                this.moveRow(this.draggedRowId, id, position, groupId);
            }

            if (this.dropTarget.type === "group") {
                const { groupId } = this.dropTarget;
                if (!groupId) {
                    this.clearVisualState(container);
                    return;
                }

                this.moveRowToGroup(this.draggedRowId, groupId);
            }

            this.clearVisualState(container);
            this.app.requestRender();
        });

        container.addEventListener("dragend", () => {
            this.clearVisualState(container);
        });
    }

    getTargetRow(target) {
        const directRow = target.closest("tr.draggable");
        if (directRow) return directRow;

        const remarkRow = target.closest("tr.remark-row");
        if (!remarkRow) return null;

        const previousRow = remarkRow.previousElementSibling;
        if (previousRow?.classList.contains("draggable")) {
            return previousRow;
        }

        return null;
    }

    clearDropMarkers(container) {
        container.querySelectorAll(".drop-top, .drop-middle, .drop-bottom")
            .forEach(el => el.classList.remove("drop-top", "drop-middle", "drop-bottom"));
    }

    clearVisualState(container) {
        this.draggedRowId = null;
        this.dropTarget = null;
        this.isHandleActive = false;

        container.querySelectorAll(".drop-top, .drop-middle, .drop-bottom, .dragging")
            .forEach(el => el.classList.remove("drop-top", "drop-middle", "drop-bottom", "dragging"));
    }

    findGroupByRowId(rowId) {
        return this.state.angebot.groups.find(group =>
            group.rows.some(row => row.id == rowId)
        );
    }

    moveRow(dragId, targetId, position, targetGroupId) {
        const sourceGroup = this.findGroupByRowId(dragId);
        const targetGroup = this.state.angebot.groups.find(gr => gr.id == targetGroupId);

        if (!sourceGroup || !targetGroup) return;

        const sourceRows = sourceGroup.rows;
        const targetRows = targetGroup.rows;
        const dragged = sourceRows.find(r => r.id == dragId);
        const target = targetRows.find(r => r.id == targetId);

        if (!dragged || !target) return;

        const block = this.getDragBlock(sourceRows, dragged);
        if (sourceGroup === targetGroup && block.includes(target)) return;

        block.forEach(row => {
            const index = sourceRows.indexOf(row);
            if (index !== -1) sourceRows.splice(index, 1);
        });

        let targetIndex = targetRows.findIndex(r => r.id == targetId);
        if (targetIndex === -1) return;

        if (position === "bottom") {
            targetIndex += 1;
        }

        block.forEach(row => {
            row.groupId = targetGroup.id;
        });

        targetRows.splice(targetIndex, 0, ...block);
        this.resolveDropHierarchy(block, target, position);
    }

    moveRowToGroup(dragId, targetGroupId) {
        const sourceGroup = this.findGroupByRowId(dragId);
        const targetGroup = this.state.angebot.groups.find(gr => gr.id == targetGroupId);

        if (!sourceGroup || !targetGroup) return;

        const dragged = sourceGroup.rows.find(r => r.id == dragId);
        if (!dragged) return;

        const block = this.getDragBlock(sourceGroup.rows, dragged);

        block.forEach(row => {
            const index = sourceGroup.rows.indexOf(row);
            if (index !== -1) sourceGroup.rows.splice(index, 1);

            row.groupId = targetGroup.id;
        });

        targetGroup.rows.push(...block);

        const root = block[0];
        root.parentMischId = null;
        root.parentGruppeId = null;
    }

    resolveDropHierarchy(block, target, position) {
        const root = block[0];

        root.parentMischId = null;
        root.parentGruppeId = null;

        if (position === "middle") {
            if (target.type === "misch") {
                root.parentMischId = target.mischId;
            }
            else if (target.type === "gruppe") {
                root.parentGruppeId = target.gruppeId;
            }
            else if (target.parentMischId) {
                root.parentMischId = target.parentMischId;
            }
            else if (target.parentGruppeId) {
                root.parentGruppeId = target.parentGruppeId;
            }
        }
        else if (position === "top" || position === "bottom") {
            root.parentMischId = target.parentMischId || null;
            root.parentGruppeId = target.parentGruppeId || null;
        }

        block.slice(1).forEach(child => {
            if (child.parentMischId && !root.mischId) {
                child.parentMischId = null;
            }

            if (child.parentGruppeId && !root.gruppeId) {
                child.parentGruppeId = null;
            }
        });
    }

    getDragBlock(rows, dragged) {
        const block = [];
        const visited = new Set();

        const collect = parent => {
            if (visited.has(parent.id)) return;
            visited.add(parent.id);

            block.push(parent);

            rows.forEach(r => {
                if (parent.type === "misch" && r.parentMischId === parent.mischId) {
                    collect(r);
                }

                if (parent.type === "gruppe" && r.parentGruppeId === parent.gruppeId) {
                    collect(r);
                }
            });
        };

        collect(dragged);
        return block;
    }
}
