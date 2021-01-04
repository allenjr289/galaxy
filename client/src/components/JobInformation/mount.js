/**
 * Endpoint for mounting job metrics from non-Vue environment.
 */
import JobInformation from "./JobInformation";
import { mountVueComponent } from "utils/mountVueComponent";

export const mountJobInformation = (propsData = {}) => {
    document.querySelectorAll(".job-information").forEach((element) => {
        propsData.job_id = element.getAttribute("job_id");
        mountVueComponent(JobInformation)(propsData, element);
    });
};
