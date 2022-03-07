
class Paginator {

    paginate (
        totalItems,
        currentPage = 1,
        recordsPerPage = 5,
        maxPages = 5
    ) {

        // calculate total pages
        let totalPages = Math.ceil(totalItems / recordsPerPage);

        // logger.info("Total");

        // ensure current page isn't out of range
        if (currentPage < 1) {
            currentPage = 1;
        } else if (currentPage > totalPages) {
            currentPage = totalPages;
        }

        let startPage, endPage;
        if (totalPages <= maxPages) {
            // total pages less than max so show all pages
            startPage = 1;
            endPage = totalPages;
        } else {
            // total pages more than max so calculate start and end pages
            let maxPagesBeforeCurrentPage = Math.floor(maxPages / 2);
            let maxPagesAfterCurrentPage = Math.ceil(maxPages / 2) - 1;
            if (currentPage <= maxPagesBeforeCurrentPage) {
                // current page near the start
                startPage = 1;
                endPage = maxPages;
            } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
                // current page near the end
                startPage = totalPages - maxPages + 1;
                endPage = totalPages;
            } else {
                // current page somewhere in the middle
                startPage = currentPage - maxPagesBeforeCurrentPage;
                endPage = currentPage + maxPagesAfterCurrentPage;
            }
        }

        // calculate start and end item indexes
        let startIndex = (currentPage - 1) * recordsPerPage;
        let endIndex = Math.min(startIndex + recordsPerPage - 1, totalItems - 1);

        // create an array of pages to ng-repeat in the pager control
        let pages = Array.from(Array((endPage + 1) - startPage).keys()).map(i => startPage + i);

        // return object with all pager properties required by the view
        let pagerProp = {
            totalItems: totalItems,
            currentPage: currentPage,
            recordsPerPage: recordsPerPage,
            totalPages: totalPages,
            pageToShow: maxPages,
            startPage: startPage,
            endPage: endPage,
            firstRecordIndexOfCurrentPage: startIndex, // the start record to show from this page
            lastRecordIndexOfCurrentPage: endIndex,     // the last record to show in this page
            pages: pages
        };
        return pagerProp;
    }

}

module.exports = new Paginator();