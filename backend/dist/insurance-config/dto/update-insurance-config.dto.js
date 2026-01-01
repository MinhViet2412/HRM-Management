"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateInsuranceConfigDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_insurance_config_dto_1 = require("./create-insurance-config.dto");
class UpdateInsuranceConfigDto extends (0, mapped_types_1.PartialType)(create_insurance_config_dto_1.CreateInsuranceConfigDto) {
}
exports.UpdateInsuranceConfigDto = UpdateInsuranceConfigDto;
//# sourceMappingURL=update-insurance-config.dto.js.map